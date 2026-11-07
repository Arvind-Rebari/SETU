
import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Search,
  Send,
  Building2,
  UserRound,
  CheckCheck,
  RefreshCw
} from "lucide-react";
import "./Messages.css";

const API = "http://localhost:5000/api";

// Prototype clinic selection. Replace with authenticated clinic identity
// when SETU authentication and authorization are implemented.
const MY_CLINIC_ID = 1;

function getConversationId(firstId, secondId) {
  return [Number(firstId), Number(secondId)]
    .sort((a, b) => a - b)
    .join("-");
}

export default function Messages() {
  const [clinics, setClinics] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const selectedClinic = clinics.find(
    (clinic) => Number(clinic.id) === Number(selectedClinicId)
  );

  const loadData = async () => {
    try {
      setError("");

      const [clinicResponse, messageResponse] = await Promise.all([
        fetch(`${API}/clinics`),
        fetch(`${API}/messages?clinic_id=${MY_CLINIC_ID}`)
      ]);

      if (!clinicResponse.ok || !messageResponse.ok) {
        throw new Error("Unable to load Messages data.");
      }

      const clinicData = await clinicResponse.json();
      const messageData = await messageResponse.json();

      const clinicList = clinicData.clinics || [];
      setClinics(clinicList);
      setMessages(messageData.messages || []);

      const otherClinics = clinicList.filter(
        (clinic) => Number(clinic.id) !== MY_CLINIC_ID
      );

      setSelectedClinicId((current) => {
        if (
          current &&
          otherClinics.some((clinic) => Number(clinic.id) === Number(current))
        ) {
          return current;
        }

        return otherClinics.length ? String(otherClinics[0].id) : "";
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const conversationId = selectedClinic
    ? getConversationId(MY_CLINIC_ID, selectedClinic.id)
    : "";

  const conversationMessages = useMemo(() => {
    return messages.filter(
      (item) => item.conversation_id === conversationId
    );
  }, [messages, conversationId]);

  const filteredClinics = clinics.filter((clinic) => {
    const isOtherClinic = Number(clinic.id) !== MY_CLINIC_ID;

    return (
      isOtherClinic &&
      clinic.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const unreadCount = (clinicId) => {
    const id = getConversationId(MY_CLINIC_ID, clinicId);

    return messages.filter(
      (item) =>
        item.conversation_id === id &&
        Number(item.receiver_clinic_id) === MY_CLINIC_ID &&
        Number(item.is_read) === 0
    ).length;
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    const cleanText = messageText.trim();

    if (!cleanText || !selectedClinic || sending) return;

    try {
      setSending(true);
      setError("");

      const response = await fetch(`${API}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          sender_clinic_id: MY_CLINIC_ID,
          receiver_clinic_id: Number(selectedClinic.id),
          message: cleanText
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Message could not be sent.");
      }

      setMessageText("");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async () => {
    if (!conversationId) return;

    try {
      await fetch(
        `${API}/messages/${encodeURIComponent(conversationId)}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clinic_id: MY_CLINIC_ID })
        }
      );

      await loadData();
    } catch (err) {
      setError("Unable to update read status.");
    }
  };

  useEffect(() => {
    if (
      conversationMessages.some(
        (item) =>
          Number(item.receiver_clinic_id) === MY_CLINIC_ID &&
          Number(item.is_read) === 0
      )
    ) {
      markAsRead();
    }
  }, [conversationId, messages.length]);

  return (
    <div className="messages-page">
      <div className="messages-heading">
        <div>
          <h1>Messages</h1>
          <p>Stay connected with your partner clinics.</p>
        </div>

        <button
          className="messages-refresh"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && <div className="messages-error">{error}</div>}

      <div className="messages-layout">
        <aside className="messages-sidebar">
          <div className="messages-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search clinics..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="messages-sidebar-title">
            <span>CLINIC CONVERSATIONS</span>
            <span>{filteredClinics.length}</span>
          </div>

          {loading ? (
            <p className="messages-empty">Loading clinics...</p>
          ) : filteredClinics.length === 0 ? (
            <p className="messages-empty">No partner clinics found.</p>
          ) : (
            filteredClinics.map((clinic) => (
              <button
                key={clinic.id}
                className={`clinic-conversation ${
                  Number(selectedClinicId) === Number(clinic.id)
                    ? "active"
                    : ""
                }`}
                onClick={() => setSelectedClinicId(String(clinic.id))}
              >
                <div className="clinic-avatar">
                  <Building2 size={21} />
                </div>

                <div className="clinic-conversation-info">
                  <strong>{clinic.name}</strong>
                  <span>{clinic.address || "Clinic partner"}</span>
                </div>

                {unreadCount(clinic.id) > 0 && (
                  <span className="unread-badge">
                    {unreadCount(clinic.id)}
                  </span>
                )}
              </button>
            ))
          )}
        </aside>

        <section className="messages-chat">
          {selectedClinic ? (
            <>
              <div className="chat-header">
                <div className="clinic-avatar">
                  <Building2 size={21} />
                </div>

                <div>
                  <h2>{selectedClinic.name}</h2>
                  <span>SETU Clinic Partner</span>
                </div>
              </div>

              <div className="chat-body">
                {conversationMessages.length === 0 ? (
                  <div className="chat-welcome">
                    <MessageCircle size={42} />
                    <h3>Start a conversation</h3>
                    <p>
                      Send a message to {selectedClinic.name}.
                    </p>
                  </div>
                ) : (
                  conversationMessages.map((item) => {
                    const isMine =
                      Number(item.sender_clinic_id) === MY_CLINIC_ID;

                    return (
                      <div
                        key={item.id}
                        className={`message-row ${
                          isMine ? "my-message-row" : "their-message-row"
                        }`}
                      >
                        <div
                          className={`message-bubble ${
                            isMine ? "my-message" : "their-message"
                          }`}
                        >
                          <p>{item.message}</p>

                          <div className="message-meta">
                            <span>
                              {new Date(
                                item.created_at.replace(" ", "T") + "Z"
                              ).toLocaleString()}
                            </span>

                            {isMine && <CheckCheck size={14} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form className="chat-input-area" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  maxLength={5000}
                />

                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                >
                  <Send size={19} />
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="chat-welcome">
              <UserRound size={42} />
              <h3>No clinic selected</h3>
              <p>Add a partner clinic to begin a conversation.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

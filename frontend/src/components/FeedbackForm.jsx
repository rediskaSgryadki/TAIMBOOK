import React, { useState } from "react";

const FeedbackForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, message }),
      });
      if (response.ok) {
        setStatus("success");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Обратная связь</h2>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="feedback-email">Ваш Email (необязательно):</label>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="feedback-message">Сообщение:</label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>
      <button type="submit" disabled={loading || !message} style={{ padding: "8px 16px" }}>
        {loading ? "Отправка..." : "Отправить"}
      </button>
      {status === "success" && <div style={{ color: "green", marginTop: 10 }}>Спасибо за ваш отзыв!</div>}
      {status === "error" && <div style={{ color: "red", marginTop: 10 }}>Ошибка отправки. Попробуйте позже.</div>}
    </form>
  );
};

export default FeedbackForm;

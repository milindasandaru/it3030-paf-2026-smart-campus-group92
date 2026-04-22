export function CreateBookingPage() {
  return (
    <section className="section-card form-card">
      <header className="section-card__header">
        <h2>Create booking request</h2>
      </header>
      <form className="booking-form">
        <label>
          Booking title
          <input placeholder="Enter activity name" type="text" />
        </label>
        <label>
          Resource
          <select>
            <option>Innovation Lab</option>
            <option>Seminar Hall 2</option>
          </select>
        </label>
        <label>
          Start time
          <input type="datetime-local" />
        </label>
        <label>
          End time
          <input type="datetime-local" />
        </label>
        <button className="primary-button" type="submit">
          Submit request
        </button>
      </form>
    </section>
  );
}



import React, { useState } from "react";
import BookingForm from "./BookingForm";

const ButtonWithDialog = () => {
  const [BookingFormOpen, setBookingFormOpen] = useState(false);
  console.log(BookingFormOpen,"buttonwithdilogue")
  
  return (
    <>
      <button
        aria-label="Add Booking"
        className="btn btn-primary"
        onClick={() => setBookingFormOpen(true)} // Open the modal
      >
        Add Booking
      </button>
      {BookingFormOpen && (
        <BookingForm
          IsModelOpen={BookingFormOpen}
          setModalOpen={setBookingFormOpen} // Pass the function to close the modal
        />
      )}
    </>
  );
};

export default ButtonWithDialog;

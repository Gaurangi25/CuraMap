import React, { useState } from "react";
import axios from "axios";
import "./AddHospitalForm.css";

function AddHospitalForm() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    latitude: "",
    longitude: "",
    type: "",
    verified: false,

    // Available details
    availableBeds: "",
    availableOxygen: "",
    ambulancesAvailable: "",
  });

  const [submitted, setSubmitted] = useState(false);

  //To prevent multiple submissions while waiting for the backend response
  const [loading, setLoading] = useState(false);

  /* ----------------- handlers ----------------- */
  //Handling change for changes in any input type
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    //console.log("Input is Changed",formData);
  }

  //handling submit form
  /*
  You’re filling a form → 
  clicking submit → 
  the data is sent to your backend via courier (axios) → 
  backend saves it in MongoDB → 
  frontend confirms "done!" and clears the form.
  */

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    //console.log("Form Submitted :", formData);
    /*
        Form Submitted : Object
            address: "abcs"
            name: "appolo"
            verified: true
            type: "general"
            [[Prototype]]: Object
    */
    // Calculate location for mongoDB
    const location = {
      type: "Point",
      coordinates: [
        parseFloat(formData.latitude),
        parseFloat(formData.longitude),
      ],
    };

    // Final hospitalData
    const hospitalData = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      availableBeds: parseInt(formData.availableBeds) || 0,
      availableOxygen: parseInt(formData.availableOxygen) || 0,
      ambulancesAvailable: parseInt(formData.ambulancesAvailable) || 0,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(formData.longitude),
          parseFloat(formData.latitude),
        ],
      },
    };

    console.log(hospitalData);

    axios
      .post("http://localhost:5000/api/hospitals", hospitalData)
      .then((res) => {
        console.log("Data sent to backend", res.data);
        setSubmitted(true);
        setLoading(false);

        //Form submitted successfully message hides after 3seconds
        setTimeout(() => setSubmitted(false), 3000);

        // clearing the prev data in form and resetting to default
        setFormData({
          name: "",
          address: "",
          phone: "",
          latitude: "",
          longitude: "",
          type: "",
          verified: false,
          availableBeds: "",
          availableOxygen: "",
          ambulancesAvailable: "",
        });
      })
      .catch((err) => {
        console.log("Error sending data: ", err);
        setLoading(false);
      });
  }

  /* ----------------- JSX ----------------- */

  return (
    <div className="hospital-form">
      <h2 className="form-title">Add Hospital</h2>

      <form onSubmit={handleSubmit} className="form-body">
        <input
          className="form-input"
          type="text"
          placeholder="Hospital Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          className="form-input"
          type="text"
          placeholder="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <input
          className="form-input"
          type="tel"
          placeholder="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          className="form-input"
          type="text"
          placeholder="Latitude"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          required
        />

        <input
          className="form-input"
          type="text"
          placeholder="Longitude"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          required
        />

        {/* Availability Inputs */}
        <input
          className="form-input"
          type="number"
          placeholder="Available Beds"
          name="availableBeds"
          value={formData.availableBeds}
          onChange={handleChange}
          min="0"
        />

        <input
          className="form-input"
          type="number"
          placeholder="Available Oxygen Units"
          name="availableOxygen"
          value={formData.availableOxygen}
          onChange={handleChange}
          min="0"
        />

        <input
          className="form-input"
          type="number"
          placeholder="Ambulances Available"
          name="ambulancesAvailable"
          value={formData.ambulancesAvailable}
          onChange={handleChange}
          min="0"
        />

        {/* checkbox to select type */}
        <label className="form-checkbox">
          <input
            type="checkbox"
            name="verified"
            checked={formData.verified}
            onChange={handleChange}
          />
          Open Now
        </label>

        {/* select options */}
        <select
          className="form-select"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="general">General</option>
          <option value="specialized">Specialized</option>
          <option value="clinic">Clinic</option>
        </select>

        <button type="submit" disabled={loading} className="form-submit-btn">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {submitted && (
        <p className="form-success-msg">✅ Form submitted successfully!</p>
      )}
    </div>
  );
}

export default AddHospitalForm;

import { getAuth } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { Container, Nav, Navbar, Col, Image, Form, Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";
import axios from "axios";
import "../App.css"


export default function BookingTable() {
    // State to store booking data
    const url = 'https://d2055d91-a6bb-4f55-afff-1fa85714cf81-00-uyokvf9g3x5j.kirk.replit.dev'
    const image = "https://www.avantisystemsusa.com/wp-content/uploads/2021/06/flexible-seating-areas.jpg";
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [isBookingAvailable, setIsBookingAvailable] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updatedBooking, setUpdatedBooking] = useState({});
    const auth = getAuth();
    const { currentUser } = useContext(AuthContext);


    useEffect(() => {
        if (!currentUser) {
            // Clear bookings data when authToken is empty
            navigate("/login");
        }
    }, [currentUser, navigate]);

    const handleLogout = () => {
        // Clear bookings data when user logs out
        auth.signOut();
    };
    // State to store form input
    const [formData, setFormData] = useState({
        booking_date: '',
        name: '',
        description: '',
        start_time: '',
        end_time: '',
        total_cost: '',
        phone_number: '',
        email: '',
        user_id: '',
    });


    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if (currentUser) {
                    const userId = currentUser.uid
                    // Fetch bookings for the current user
                    const response = await axios.get(`${url}/bookings/${userId}`);
                    setBookings(response.data);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };
        fetchBookings();
    }, [currentUser]);

    // Handle form input change
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isTimeSlotAvailable = (bookingDate, startTime, endTime, bookings) => {
        const startDateTime = new Date(`${bookingDate}T${startTime}`);
        const endDateTime = new Date(`${bookingDate}T${endTime}`);
        console.log('Requested Time Slot:', startDateTime, '-', endDateTime);

        // Check for any existing bookings that conflict with the requested time slot
        const hasConflict = bookings.some(booking => {
            const bookingStartDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
            const bookingEndDateTime = new Date(`${booking.booking_date}T${booking.end_time}`);
            // Check if the requested time slot overlaps with any existing booking time slot
            console.log('Existing Booking:', bookingStartDateTime, '-', bookingEndDateTime);
            return startDateTime < bookingEndDateTime && endDateTime > bookingStartDateTime;
        });
        // Return true if there is no conflict, otherwise return false
        return !hasConflict;
    };



    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const startTime = new Date(`2000-01-01T${formData.start_time}`);
            const endTime = new Date(`2000-01-01T${formData.end_time}`);
            const { booking_date, start_time, end_time } = formData;

            const response = await axios.get(`${url}/bookings`);
            const allBookings = response.data;

            // Check if the time slot is available
            const isAvailable = isTimeSlotAvailable(booking_date, start_time, end_time, allBookings);
            setIsBookingAvailable(isAvailable); // Update isBookingAvailable state

            if (!isAvailable) {
                console.error('The selected time slot is not available.');
                return;
            }

            const durationInMs = endTime - startTime;
            const durationInHours = durationInMs / (1000 * 60 * 60);
            let totalCost = durationInHours * 20;
            const formattedTotalCost = `RM ${totalCost.toFixed(2)}`;


            if (currentUser) {
                const userId = currentUser.uid;
                setFormData({ ...formData, user_id: userId });


                await axios.post(`${url}/bookings`, { ...formData, total_cost: formattedTotalCost, user_id: userId });
                // After successful submission, fetch updated booking data for the current user only
                const response = await axios.get(`${url}/bookings/${userId}`);
                setBookings(response.data);
                window.alert('Booking successfully added!');
                // Clear form data
                setFormData({
                    booking_date: '',
                    name: '',
                    description: '',
                    start_time: '',
                    end_time: '',
                    total_cost: '',
                    phone_number: '',
                    email: '',
                    user_id: '',
                });
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            if (currentUser) {
                const userId = currentUser.uid;
                const response = await axios.get(`${url}/bookings/${userId}`);
                setBookings(response.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleDeleteBooking = async (booking_id) => {
        try {
            await axios.delete(`${url}/bookings/${booking_id}`);
            window.alert('Booking successfully deleted!');
            fetchBookings(); // Fetch updated bookings after deletion
        } catch (error) {
            console.error('Error deleting booking:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            if (selectedBooking) {
                const startTime = new Date(`2000-01-01T${updatedBooking.start_time}`);
                const endTime = new Date(`2000-01-01T${updatedBooking.end_time}`);
                const durationInMs = endTime - startTime;
                const durationInHours = durationInMs / (1000 * 60 * 60);
                const totalCost = durationInHours * 20;
                const formattedTotalCost = `RM ${totalCost.toFixed(2)}`;

                // Update the total_cost in the updatedBooking state
                setUpdatedBooking({ ...updatedBooking, total_cost: formattedTotalCost });
                await axios.put(`${url}/bookings/${selectedBooking.booking_id}`, updatedBooking);
                setShowModal(false);
                fetchBookings();
            }
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };




    return (
        <>
            <Navbar bg="dark" variant="light" expand="md" fixed="top">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="text-white">CoWorking</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link className="custom-nav-link text-white" as={Link} to="/bookingmanagementpage" style={{ display: currentUser && currentUser.email === 'user@admin.com' ? 'block' : 'none' }}>Admin Management</Nav.Link>

                            <Nav.Link className="custom-nav-link1" onClick={handleLogout} to="/">
                                <i className="bi bi-box-arrow-right text-white" style={{ fontSize: "1.5rem" }}></i>
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar >


            <div style={{ paddingTop: '80px' }}>

                <Container >
                    <div className="d-flex h-100">
                        <Col sm={6}>
                            <Image src={image} fluid style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </Col>
                        <Col sm={6} className="border shadow p-5" >
                            <Form onSubmit={handleSubmit}>
                                <div className="d-flex ">
                                    <Form.Group controlId="booking_date">
                                        <Form.Label className="text-secondary" style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif', fontSize: '13px' }} >Booking Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="booking_date"
                                            value={formData.booking_date}
                                            onChange={handleInputChange}
                                            className="border-0 border-bottom rounded-0 shadow-none"
                                            style={{ width: "250px" }}
                                            min={new Date().toISOString().split('T')[0]}
                                            required

                                        />
                                    </Form.Group>
                                    <Form.Group controlId="name" className="mx-auto">
                                        <Form.Label className="text-secondary" style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif', fontSize: '13px' }} >Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            placeholder="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="border-0 border-bottom rounded-0 shadow-none "
                                            style={{ width: "250px" }}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <Form.Group controlId="description" className="mt-3">
                                    <Form.Label className="text-secondary" style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif', fontSize: '13px' }} >Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="description"
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="border-0 border-bottom rounded-0 shadow-none"
                                        required
                                    />
                                </Form.Group>
                                <div className="d-flex mt-3">
                                    <Form.Group controlId="start_time">
                                        <Form.Label className="text-secondary" style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif', fontSize: '13px' }} >Start Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="start_time"
                                            value={formData.start_time}
                                            onChange={handleInputChange}
                                            className="border-0 border-bottom rounded-0 shadow-none"
                                            style={{ width: "250px" }}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="end_time" className="mx-auto">
                                        <Form.Label className="text-secondary" style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif', fontSize: '13px' }} >End Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="end_time"
                                            value={formData.end_time}
                                            onChange={handleInputChange}
                                            className="border-0 border-bottom rounded-0 shadow-none"
                                            style={{ width: "250px" }}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                {!isBookingAvailable && (
                                    <p style={{ color: 'red' }}>Time slot is not available.</p>
                                )}
                                <div className="d-flex mt-3">
                                    <Form.Group controlId="phone_number">
                                        <Form.Label className="text-secondary" style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif', fontSize: '13px' }} >Phone number</Form.Label>

                                        <Form.Control
                                            type="tel"
                                            name="phone_number"
                                            placeholder="Phone Number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            className="border-0 border-bottom rounded-0 shadow-none"
                                            style={{ width: "250px" }}
                                            required
                                        />

                                    </Form.Group>
                                    <Form.Group controlId="email" className="mx-auto">
                                        <Form.Label className="text-secondary" style={{ fontFamily: 'Lato, Helvetica, Arial, sans-serif', fontSize: '13px' }} >Email address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="border-0 border-bottom rounded-0 shadow-none"
                                            style={{ width: "250px" }}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                                <button type="submit" className="border-0 mt-3" style={{ backgroundColor: "#e75635", color: "white", width: "200px", height: "40px" }}>REQUEST TO BOOK</button>

                            </Form>
                        </Col>
                    </div>
                </Container >
                <Col sm={10} className="mx-auto">
                    <Container>
                        <div className="table-responsive pt-3 shadow">
                            <table className="table table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Booking Id</th>
                                        <th>Booking Date</th>
                                        <th>Description</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Total Cost</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, index) => (
                                        <tr key={index}>
                                            <td>{booking.booking_id}</td>
                                            <td>{booking.booking_date.substring(0, 10)}</td>
                                            <td>{booking.description}</td>
                                            <td>{booking.start_time}</td>
                                            <td>{booking.end_time}</td>
                                            <td style={{ color: 'green' }}>{booking.total_cost}</td>
                                            <td >
                                                <button
                                                    onClick={() => handleDeleteBooking(booking.booking_id)}
                                                    className="btn btn-danger mr-2 "
                                                    style={{ cursor: 'pointer', transition: 'background-color 0.3s' }}
                                                >
                                                    <span>Delete Booking</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setUpdatedBooking(booking);
                                                        setShowModal(true);
                                                    }}
                                                    className="btn btn-success"
                                                    style={{ cursor: 'pointer', transition: 'background-color 0.3s' }}
                                                >
                                                    <span>Update Booking</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <Modal show={showModal} onHide={() => setShowModal(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Update Booking</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group controlId="bookingDate">
                                            <Form.Label>Booking Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={updatedBooking.booking_date}
                                                onChange={(e) => setUpdatedBooking({ ...updatedBooking, booking_date: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="description">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={updatedBooking.description}
                                                onChange={(e) => setUpdatedBooking({ ...updatedBooking, description: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="start_time">
                                            <Form.Label>Start time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={updatedBooking.start_time}
                                                onChange={(e) => setUpdatedBooking({ ...updatedBooking, start_time: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="end_time">
                                            <Form.Label>End time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={updatedBooking.end_time}
                                                onChange={(e) => setUpdatedBooking({ ...updatedBooking, end_time: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={handleUpdate}>
                                        Save Changes
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </Container>

                </Col >
            </div >

        </>
    );
}


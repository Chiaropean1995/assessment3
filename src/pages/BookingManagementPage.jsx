import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Nav, Navbar, Col, Form, Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";


export default function BookingTable() {
    // State to store booking data
    const [bookings, setBookings] = useState([]);
    const url = 'https://d2055d91-a6bb-4f55-afff-1fa85714cf81-00-uyokvf9g3x5j.kirk.replit.dev'
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updatedBooking, setUpdatedBooking] = useState({});
    const { currentUser } = useContext(AuthContext);


    useEffect(() => {
        console.log("Current User:", currentUser);
        // Your code logic here
    }, [currentUser]);



    useEffect(() => {

        if (currentUser) {
            try {
                const username = currentUser.email;
                console.log("User Name:", username);
                setIsAdmin(username === 'user@admin.com');
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, [currentUser]);


    // Fetch booking data from database
    useEffect(() => {
        if (isAdmin) {
            const fetchBookings = async () => {
                try {
                    const response = await axios.get(`${url}/bookings`);
                    setBookings(response.data);
                } catch (error) {
                    console.error('Error fetching bookings:', error);
                }
            };
            fetchBookings();
        }
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <h2>You are not authorized to access this page.</h2>
                </div>
            </div>
        )
    }

    const fetchBookings = async () => {
        try {
            const response = await axios.get(`${url}/bookings`);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleDeleteBooking = async (booking_id) => {
        try {
            await axios.delete(`${url}/bookings/${booking_id}`);
            fetchBookings(); // Fetch updated bookings after deletion
        } catch (error) {
            console.error('Error deleting booking:', error);
        }
    };


    const handleUpdate = async () => {
        try {
            if (selectedBooking) {
                await axios.put(`${url}/bookings/${selectedBooking.booking_id}`, updatedBooking);
                setShowModal(false);
                fetchBookings();
            }
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };
    const confirmBooking = async (email, booking_id) => {

        try {
            const response = await axios.post(`${url}/confirm-booking`, { email, booking_id });
            console.log(response.data.message);
            alert('Booking confirmed and email sent successfully');
        } catch (error) {
            console.error('Error confirming booking and sending email:', error);
            alert('Error confirming booking and sending email');
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
                            <Nav.Link className="custom-nav-link text-white" as={Link} to="/bookingpage">Home</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar >
            <Col >
                <div style={{ paddingTop: '80px' }}>
                    <table className="table table-bordered table-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>Booking Id</th>
                                <th>Booking Date</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Phone Number</th>
                                <th>Email</th>
                                <th >Total Cost</th>
                                <th>User ID</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={index}>
                                    <td>{booking.booking_id}</td>
                                    <td>{booking.booking_date.substring(0, 10)}</td>
                                    <td>{booking.name}</td>
                                    <td>{booking.description}</td>
                                    <td>{booking.start_time}</td>
                                    <td>{booking.end_time}</td>
                                    <td>{booking.phone_number}</td>
                                    <td>{booking.email}</td>
                                    <td style={{ color: 'green' }}>{booking.total_cost}</td>
                                    <td>{booking.user_id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <i onClick={() => handleDeleteBooking(booking.booking_id)} className="bi bi-trash" style={{ cursor: 'pointer', marginRight: '10px' }}></i>
                                            <i
                                                className="bi bi-pencil-square"
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setUpdatedBooking(booking);
                                                    setShowModal(true);
                                                }}
                                                style={{ cursor: 'pointer', marginRight: "10px" }}
                                            ></i>
                                            <button onClick={() => confirmBooking(booking.email, booking.booking_id)}>
                                                <i className="bi bi-check-lg" style={{ cursor: 'pointer', fontSize: '1rem' }}></i>
                                            </button>
                                        </div>
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
                                <Form.Group controlId="name">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={updatedBooking.name}
                                        onChange={(e) => setUpdatedBooking({ ...updatedBooking, name: e.target.value })}
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
                                <Form.Group controlId="phone_number">
                                    <Form.Label>Phone number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={updatedBooking.phone_number}
                                        onChange={(e) => setUpdatedBooking({ ...updatedBooking, phone_number: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={updatedBooking.email}
                                        onChange={(e) => setUpdatedBooking({ ...updatedBooking, email: e.target.value })}
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
            </Col >
        </>
    );
}


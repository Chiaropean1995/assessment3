import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth"
import { Col, Image, Row, Button, Modal, Form } from "react-bootstrap";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";


export default function AuthPage() {
    const loginImage = "https://i.im.ge/2024/03/14/RhSPox.coworking-space-in-gurgaon-5485822-1280.jpeg";
    const cover = "https://coworkingmap.org/wp-content/uploads/2015/09/coworking-logo.jpg.jpg"
    const [modalShow, setModalShow] = useState(null);
    const handleShowSignUp = () => setModalShow("SignUp");
    const handleShowLogin = () => setModalShow("Login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();
    const { currentUser } = useContext(AuthContext);
    useEffect(() => {
        if (currentUser) navigate("bookingpage");
    }, [currentUser, navigate])

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await createUserWithEmailAndPassword(
                auth,
                username,
                password
            );
            console.log(res.user)
        } catch (error) {
            console.error(error);
            setError("Invalid password or username");
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, username, password)

        } catch (error) {
            console.error(error);
            setError("Invalid password or username");
        }
    };

    const provider = new GoogleAuthProvider();
    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
            setError("Invalid password or username");
        }
    }

    const handleClose = () => {
        setModalShow(null);
        setError(null);
    }
    return (
        <Row>
            <Col sm={7}>
                <Image src={loginImage} fluid style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Col>
            <Col sm={5} className="p-4 d-flex flex-column align-items-center">
                <Image src={cover} fluid style={{ height: "130px" }} />
                <p className="mt-5" style={{ fontSize: 30, fontWeight: 'bold', color: '#333' }}>
                    Hello! Welcome to <span style={{ color: '#007bff' }}>CoWorking</span>
                </p>
                <h2 className="my-5" style={{ fontSize: 31, fontWeight: 'bold', color: '#333' }}>
                    Book your <span style={{ color: '#007bff' }}>co working space</span>.
                </h2>

                <Col sm={5} className="d-grid gap-2">
                    <Button
                        className="rounded-pill btn-google"
                        variant="outline-dark"
                        onClick={handleGoogleLogin}
                    >
                        <i className="bi bi-google"></i> Sign up with Google
                    </Button>
                    <Button className="rounded-pill btn-apple" variant="outline-dark">
                        <i className="bi bi-apple"></i> Sign up with Apple
                    </Button>
                    <p style={{ textAlign: "center", margin: "10px 0" }}>or</p>
                    <Button className="rounded-pill btn-create-account" onClick={handleShowSignUp}>
                        Create an account
                    </Button>
                    <p style={{ fontSize: "12px", margin: "10px 0", textAlign: "center" }}>
                        By signing up, you agree to the Terms of Service and Privacy Policy including Cookie Use
                    </p>
                    <p className="mt-5" style={{ fontWeight: "bold", textAlign: "center" }}>
                        Already have an account?
                    </p>
                    <Button
                        className="rounded-pill btn-sign-in"
                        variant="outline-primary"
                        onClick={handleShowLogin}
                    >
                        Sign In
                    </Button>
                </Col>
                <Modal
                    show={modalShow !== null}
                    onHide={handleClose}
                    animation={false}
                    centered
                >
                    <Modal.Body>
                        <h2 className="mb-4" style={{ fontWeight: "bold" }}>
                            {modalShow === "SignUp"
                                ? "Create your account"
                                : "Login your account"}
                        </h2>
                        <Form className="d-grid gap-2 px-5"
                            onSubmit={modalShow === "SignUp" ? handleSignUp : handleLogin}
                        >
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Control
                                    onChange={(e) => setUsername(e.target.value)}
                                    type="email"
                                    placeholder="Enter email"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Control
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder="Password"
                                />
                            </Form.Group>
                            {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
                            <p style={{ fontSize: "12px" }}>
                                By signing up, you agree to the Terms of Service and Privacy Policy, including Cookie Use. Coworking may use your contact information, including your email addres and phone number for purposes outlined in our Privacy Policy, like keeping your account secure and personalising our services, including ads. Learn more. Others will be able to find you by email or phone number, when provided, unless you choose otherwise here.
                            </p>
                            <Button className="rounded-pill" type="submit">
                                {modalShow === "SignUp" ? "Sign up" : "Log in"}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Col>
        </Row>
    )
}
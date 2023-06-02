import React, { useState, useEffect } from 'react';
import { TbPlayCard } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { login, getScoreboard } from '../API/slice.js';
import { useDispatch, useSelector } from 'react-redux'


const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");

    const { isLoading, isError, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!isLoading && localStorage.getItem('token')) navigate('/game');
    }, [isLoading]);

    const onSubmit = async () => {
        await dispatch(login(userName));
        dispatch(getScoreboard())
    }


    return (
        <>
            <div style={{ marginTop: '5rem', color: '#fff' }}>
                <Container style={{ marginBottom: '25px' }}>
                    <Row>
                        <Col>
                            <h1 style={{ fontWeight: '600' }}><TbPlayCard size={50} />&nbsp;Playing Cards Game</h1>
                        </Col>
                    </Row>
                </Container>

                <Form >

                    <Container fluid>
                        <Row>

                            <Col lg={4}>

                            </Col>

                            <Col lg={4}>

                                <Col >
                                    <Form.Group >
                                        <Form.Control
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            name="userName"
                                            className="form-control"
                                            placeholder="Enter Username"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col >
                                </Col>
                                <Col >
                                    <Form.Group>

                                        {userName !== '' ?
                                            <Button style={{ width: '100%', marginTop: '1rem' }} variant="btn btn-lg btn-success" onClick={onSubmit}>Connect</Button>
                                            :
                                            <Button disabled style={{ width: '100%', marginTop: '1rem' }} variant="btn btn-lg btn-danger">Connect</Button>
                                        }
                                        <Button style={{ width: '100%', marginTop: '1rem' }} size='lg' variant="btn btn-info" onClick={() => navigate('/scoreboard')}>Score Board</Button>
                                    </Form.Group>
                                </Col>
                            </Col>

                            <Col lg={4}>

                            </Col>

                        </Row>

                    </Container>
                </Form>
            </div>
        </>
    );
}

export default Login;
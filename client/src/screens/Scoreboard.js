import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { getScoreboard } from '../API/slice';
import LottieView from 'lottie-react'
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'

const Scoreboard = () => {

    const [scoreboard, setScoreboard] = useState([]);

    const { isLoading, isError, message } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('scoreboard')) setScoreboard(JSON.parse(localStorage.getItem('scoreboard')));
    }, []);

    return (
        <>
            <Container style={{ height: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

                {
                    !isLoading && !isError ?
                        (
                            scoreboard.length > 0 ?
                                (
                                    <Row style={{
                                        backgroundColor: '#CD8742', width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', padding: '5%'
                                    }}>
                                        <Row style={{ fontWeight: '700' }} >
                                            <Col><u>Place:</u></Col>
                                            <Col><u>Name:</u></Col>
                                            <Col><u>Points:</u></Col>
                                        </Row>
                                        {scoreboard.map((player, index) => (
                                            <Row key={index} >
                                                <Col>{index + 1}.</Col>
                                                <Col>{player.name}</Col>
                                                <Col>{player.points}</Col>
                                            </Row>
                                        ))}
                                    </Row>
                                )
                                :
                                (
                                    <Col style={{ fontSize: '30px', fontWeight: '700' }}>
                                        <u>{message ? message : "SOME ERROR OCCURED"}</u>
                                    </Col>
                                )
                        ) :
                        !isError ?
                            (
                                <LottieView
                                    animationData={require('../assets/98288-loading.json')}
                                    loop={true}
                                    style={{ width: '40%' }}
                                />
                            ) :
                            (
                                <Col style={{ fontSize: '30px', fontWeight: '700' }}>
                                    <u>{message !== undefined ? message : "Some Error Occured: Please Check Your Connection"}</u>
                                </Col>
                            )
                }
                <Row>
                    <Button style={{ width: '100%', marginTop: '2rem' }} size='lg' variant="btn btn-info" onClick={() => navigate('/')}>Back To Connection</Button>
                </Row>

            </Container>
        </>
    );
}

export default Scoreboard;
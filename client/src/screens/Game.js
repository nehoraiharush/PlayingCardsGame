import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import TimerCountdown from 'react-countdown';
import LottieView from 'lottie-react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { logout, updatePoints, getScoreboard } from '../API/slice.js';
import { useDispatch } from 'react-redux';

const URL = 'https://nehoraiharush.github.io';
const socket = io.connect(URL)

const Game = (props) => {
    const [connected, setConnection] = useState(false);
    const [selectedCard, setSelectedCard] = useState({});
    const [selectedRoom, setSelectedRoom] = useState("");
    const [resCard, setResCard] = useState({});
    const [opponentCardsLength, setOpponentCardsLength] = useState(53);
    const [myCards, setMyCards] = useState([]);
    const [myTurn, setTurn] = useState(false);
    const [isSearching, setSearching] = useState(false);
    const [opponentTieCards, setOpponentTieCards] = useState([]);
    const [tieCards, setTieCards] = useState([]);
    const [isTie, setTie] = useState(false);
    const [winner, setWinner] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [tieGame, setTieGame] = useState(false);
    const [startTime, setStartTime] = useState(undefined);
    const [pointsToUpdate, setPointsToUpdated] = useState(0);
    const [extraTimeAdded, setExtraTimeAdded] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const timerRef = useRef(null);

    const handleChecking = () => {
        if (Object.keys(selectedCard).length > 0 && Object.keys(resCard).length > 0 && selectedCard.active && resCard.active) {
            selectedCard.active = false;
            resCard.active = false;
            if (selectedCard.value > resCard.value) {
                if (opponentTieCards.length > 0) {
                    setMyCards([...tieCards, ...opponentTieCards, ...myCards]);
                    setTie(false);
                }
                else setMyCards([resCard, selectedCard, ...myCards]);
                if (opponentTieCards.length > 0) { setOpponentTieCards([]); setTieCards([]); }
            } else if (selectedCard.value === resCard.value) {
                if (JSON.stringify(tieCards[tieCards.length - 1]) !== JSON.stringify(selectedCard)) setTieCards([...tieCards, selectedCard]);
                setTie(true)
            } else {
                if (tieCards.length > 0) setOpponentCardsLength((prev) => prev + opponentTieCards.length + tieCards.length)
                else setOpponentCardsLength((prev) => prev + 2)
                if (opponentTieCards.length > 0) { setTie(false); setOpponentTieCards([]); setTieCards([]); }
            }


        }

    }

    const logout_func = () => {
        dispatch(logout(localStorage.getItem('userName')))
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        Exit(selectedRoom)
        navigate('/')
    }

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/')
    }, [])

    //Handle the reload and exit button
    useEffect(() => {
        window.onbeforeunload = () => {
            dispatch(logout(localStorage.getItem('userName')))
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            Exit(selectedRoom);
        }
    }, []);
    //Setting all vars to default when exit from game
    const ClearAll = () => {
        setConnection(false);
        setMyCards([]);
        setResCard({});
        setTieCards([]);
        setOpponentTieCards([]);
        setSelectedCard({});
        setSelectedRoom("");
        setWinner(false);
        setTie(false);
        setSearching(false);
        setGameOver(false);
        setOpponentCardsLength(53);
        setTieGame(false);
        setStartTime(undefined);
        setPointsToUpdated(0);
        setExtraTimeAdded(false);
    }
    const Exit = (data) => {
        ClearAll();
        socket.emit('exit', { selectedRoom: data });
    }
    const JoinRoom = () => {
        socket.emit("join_room", localStorage.getItem('userName'));
    }
    const FindMatch = () => {
        if (connected) { Exit(selectedRoom); }
        JoinRoom();
    }
    //ACTIVATE SERCHING LOTTIE
    useEffect(() => {
        if (selectedRoom !== "") setSearching(true);
    }, [selectedRoom])
    //SEND CARDS IN TIE
    useEffect(() => {
        if (isTie && (tieCards.length === 4 || (tieCards.length >= 4 && (tieCards.length - 4) % 3 === 0) || myCards.length === 0)) {
            setTurn(false);
            socket.emit("send_card", { selectedCard: [...tieCards], selectedRoom });
        }
        else if (extraTimeAdded && !isTie) setGameOver(true)
    }, [isTie, tieCards]);
    //SEND CARD
    useEffect(() => {
        if (selectedRoom !== "" && !isTie) {
            socket.emit("send_card", { selectedCard: [selectedCard], selectedRoom });
            setTurn(false);
        }
    }, [selectedCard]);
    //HANDLE REDUCING THE OPPONENT LENGTH
    useEffect(() => {
        if (Object.keys(resCard).length > 0) {
            if (opponentTieCards.length > 0) setOpponentCardsLength((prev) => prev - (opponentTieCards.length <= 4 ? 4 - opponentTieCards.length % 4 - 1 : 3 - (opponentTieCards.length - 4) % 3));
            else setOpponentCardsLength((prev) => prev - 1);
        }
    }, [resCard]);
    //HANDLE CHECKING 2 CARDS
    useEffect(() => {
        if (!isTie || tieCards.length === 4 || myCards.length === 0 || (tieCards.length >= 4 && (tieCards.length - 4) % 3 === 0)) handleChecking()
    }, [selectedCard, resCard])
    //ON METHODS
    useEffect(() => {
        socket.on("recieve_card", (data) => {
            if (data.length === 1) setResCard(data[0]);
            else {
                setResCard(data[data.length - 1]);
                setOpponentTieCards([...opponentTieCards, ...data]);
            }
            setTurn(true);
        });
        socket.on("get_my_cards", (data) => { setMyCards(data.cards); setTurn(data.flag); });
        socket.on("get_room_name", (data) => { setSelectedRoom(data); });
        socket.on("disconnected", () => Exit(selectedRoom));
        socket.on("connected", () => { setConnection(true); setSearching(false); setStartTime(Date.now()) });
        socket.on("TIEONPOINTS", (data) => {
            setPointsToUpdated(data);
            setTieGame(true)
            Dispatch()
        });
        socket.on("winner", (data) => {
            if (pointsToUpdate === 0) {
                setPointsToUpdated(data);
                setWinner(true)
            }
        });
        socket.on("loser", () => { Dispatch(); console.log("TT") })
    }, [socket]);

    useEffect(() => {
        if (winner) Dispatch();
    }, [winner])
    //DISPATCH
    const Dispatch = async () => {
        if (pointsToUpdate > 0) await dispatch(updatePoints({ userName: localStorage.getItem('userName'), points: pointsToUpdate }));
        await dispatch(getScoreboard());
    }

    //HANDLE WIN
    useEffect(() => {
        if (!isTie && ((connected && Object.keys(selectedCard).length > 0 && Object.keys(resCard).length > 0 && ((opponentCardsLength === 0 && myCards.length > 0) || (myCards.length === 0 && opponentCardsLength > 0))) || gameOver)) {
            setGameOver(true);
            setTurn(false);
            if (opponentCardsLength > 0 && myCards.length > 0) {
                socket.emit("gameOver", { cards: myCards, room: selectedRoom });
            }
            else if (opponentCardsLength === 0) setWinner(true);
        }
    }, [opponentCardsLength, myCards.length, gameOver]);


    useEffect(() => {
        if (timerRef.current && gameOver) {
            timerRef.current.getApi().stop();
        }
    }, [gameOver]);


    return (
        <div className="game">
            <Container fluid>
                {isSearching && !connected ?
                    (
                        <Row style={{ display: 'flex', justifyContent: 'center' }}>
                            <LottieView
                                animationData={require('../assets/98723-search-users.json')}
                                loop={true}
                                style={{ width: '40%' }}
                            />
                        </Row>
                    )
                    :
                    (<>
                        <Row style={{ marginTop: '20px' }}>
                            <Col lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
                                {connected && myCards.length > 0 &&
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <h3 style={{ color: 'white' }} >{myCards.length}</h3>
                                        <Card style={{ width: '22%' }}>
                                            <Card.Img
                                                onClick={() => {
                                                    if (myTurn) {
                                                        if (myCards[myCards.length - 1].active === false) myCards[myCards.length - 1].active = true;
                                                        if (isTie) setTieCards([...tieCards, myCards[myCards.length - 1]]);
                                                        setSelectedCard(myCards[myCards.length - 1])
                                                        myCards.splice(myCards.length - 1, 1);
                                                    }
                                                }}
                                                src={myCards[myCards.length - 1].image}
                                            />
                                        </Card>
                                    </div>
                                }
                            </Col>

                            <Col lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
                                {connected && Object.keys(selectedCard).length > 0 &&
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <h3 style={{ color: 'white' }} >Your Card</h3>
                                        <Card style={{ width: '22%' }}>
                                            <Card.Img src={selectedCard?.image} />
                                        </Card>
                                    </div>
                                }
                            </Col>

                            <Col lg={4}></Col>

                        </Row>
                        <Row style={{ marginTop: '5%' }}>
                            <Col lg={6} style={{ display: 'flex', justifyContent: 'center' }} >
                                {connected && <TimerCountdown
                                    date={startTime + 10000}
                                    intervalDelay={0}
                                    precision={3}
                                    ref={timerRef}
                                    key={startTime}
                                    onComplete={() => {
                                        if (!isTie) setGameOver(true);
                                        else { setStartTime((prev) => prev + 10000); setExtraTimeAdded(true); }
                                    }}
                                    renderer={props => <h2 style={{ color: 'white', backgroundColor: 'black', borderRadius: '20px', width: '100px', display: 'flex', justifyContent: 'center' }}>{props.formatted.minutes}:{props.formatted.seconds}</h2>}
                                />}
                            </Col>
                            <Col lg={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {connected &&
                                    <h2 style={{ backgroundColor: 'white', borderRadius: '10px', textAlign: 'center' }}>
                                        {
                                            !gameOver ?
                                                myTurn ?
                                                    (` YOUR TURN \n 
                                                            ${isTie && myCards.length > 0 && (tieCards.length > 0 && ((tieCards.length < 4 && 4 - tieCards.length % 4 !== 0) || (3 - (tieCards.length - 4) % 3 !== 0))) ?
                                                            (`TIE! ${tieCards.length < 4 ? 4 - tieCards.length % 4 : 3 - (tieCards.length - 4) % 3} Card Left To Submit`) : ("")}`)
                                                    : " Waiting For The Opponent To Play "
                                                : (winner ? " YOU WON! :) " : tieGame ? "Its a TIE!" : "YOY LOST! :(")}
                                    </h2>
                                }
                            </Col>
                        </Row>
                        <Row style={{ marginTop: '5%' }}>

                            <Col lg={4} ></Col>

                            <Col lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
                                {connected && Object.keys(resCard).length > 0 &&
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <h3 style={{ color: 'white' }} >Opponent Card</h3>
                                        <Card style={{ width: '22%' }} >
                                            <Card.Img src={resCard.image} />
                                        </Card>
                                    </div>
                                }
                            </Col>

                            <Col lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
                                {connected &&
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <h3 style={{ color: 'white' }} >{opponentCardsLength}</h3>
                                        <Card style={{ width: '23%' }}>
                                            <Card.Img
                                                src={'https://res.cloudinary.com/drthbhsta/image/upload/v1684273894/card_back_wnofv0.jpg'} />
                                        </Card>
                                    </div>
                                }
                            </Col>

                        </Row></>)
                }
                <Row style={{ marginTop: '3%' }} >
                    <Col lg={4}  >
                    </Col>
                    <Col lg={4} >
                        <Button style={{ width: '100%' }} variant="btn btn-lg btn-info" onClick={FindMatch}>Find Match</Button>
                        <Button style={{ width: '100%', marginTop: '2%' }} variant="btn btn-md btn-danger" onClick={logout_func}>Logout</Button>
                    </Col>
                    <Col lg={4} >
                    </Col>
                </Row>

            </Container>
        </div>
    );
};


export default Game;

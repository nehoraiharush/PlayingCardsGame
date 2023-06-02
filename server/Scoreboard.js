import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import UserName from './UserName.js';
import jwt from 'jsonwebtoken';

router.post('/Login', async (req, res) => {
    const req_userName = req.body.userName;

    UserName.findOne({ name: req_userName })
        .then(async userName => {
            if (!userName) {
                const _id = new mongoose.Types.ObjectId();
                const _userName = new UserName({
                    _id: _id,
                    name: req_userName,
                    online: true,
                    points: 0
                })
                _userName.save()
                    .then(async username_save => {
                        const keyToken = 'm1eIkEjW6Jl64pYbuXsrXixLJpfupNbT';
                        const data = { username_save };
                        //generate jwt token
                        const token = await jwt.sign(data, keyToken);
                        return res.status(200).json({
                            status: true,
                            message: username_save,
                            token: token,
                        });
                    })
                    .catch(err => {
                        return res.status(500).json({
                            status: false,
                            message: err.message
                        });
                    });
            } else {
                if (!userName.online) {
                    userName.updateOne({ online: true })
                        .then(async updated => {
                            const keyToken = 'm1eIkEjW6Jl64pYbuXsrXixLJpfupNbT';
                            const data = { userName };
                            //generate jwt token
                            const token = await jwt.sign(data, keyToken);
                            return res.status(200).json({
                                status: true,
                                message: userName,
                                token: token,
                            });
                        })
                        .catch(err => {
                            console.log(`Error: ${err.message}`)
                            return res.status(500).json({
                                status: false,
                                message: err.message
                            });
                        });
                } else {
                    console.log(`There is already player online named ${req_userName}`)
                    return res.status(200).json({
                        status: false,
                        message: `There is already player online named ${req_userName}`
                    })
                }

            }
        })
        .catch(err => {
            console.log(`Error: ${err.message}`)
            return res.status(500).json({
                status: false,
                message: err.message
            });
        });
});

router.post('/updatePoints', async (req, res) => {
    const { points, userName } = req.body;

    UserName.findOne({ name: userName })
        .then(player => {
            if (player) {
                const oldPoints = player.points;
                player.updateOne({
                    points: oldPoints + points
                })
                    .then(updated => {
                        res.status(200).json({
                            status: true,
                            message: `${userName}'s points has been updated`
                        })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            status: false,
                            message: err.message
                        });
                    });
            } else {
                return res.status(200).json({
                    status: false,
                    message: `User Not Found`
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        });
});

router.post('/logout', async (req, res) => {
    const userName = req.body.userName;
    UserName.findOne({ name: userName })
        .then(async found_userName => {
            if (found_userName) {
                if (found_userName.online) {
                    found_userName.updateOne({ online: false })
                        .then(updated => {
                            return res.status(200).json({
                                status: true,
                                message: `${userName} has been loged out`
                            })
                        })
                        .catch(err => {
                            return res.status(500).json({
                                status: false,
                                message: err.message
                            });
                        });
                }
                else {
                    return res.status(200).json({
                        status: false,
                        message: `User Not Connected At All`
                    })
                }
            } else {
                return res.status(200).json({
                    status: false,
                    message: `User Not Found`
                })
            }

        })
        .catch(err => {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        });
});

router.get('/getAll', async (req, res) => {
    UserName.find()
        .then(players => {
            if (players.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: players.sort((a, b) => b.points - a.points)
                });
            } else {
                return res.status(200).json({
                    status: false,
                    message: "Players not found"
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        });

});

export default router;
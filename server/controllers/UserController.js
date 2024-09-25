const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const Imagekit = require('imagekit');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client();
const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

const imagekit = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const isBase64 = async (userId, image) => {
    const isBase64 = base64regex.test(image);
    let imagekitImg = "";
    let imageId = "";

    if(isBase64) {
        await imagekit.upload({
            file : image, //required
            fileName : userId,
            folder: "Users_Avatar",  //required
            extensions: [
                {
                    name: "google-auto-tagging",
                    maxTags: 5,
                    minConfidence: 95
                }
            ],
            transformation: {
                pre: 'r-max',
                post: [
                    {
                        type: 'transformation',
                        value: 'w-100'
                    }
                ]
            }
        }).then(response => {
            console.log(response);
            imagekitImg = response.name;
            imageId = response.fileId;
        }).catch(error => {
            console.log(error);
        });

        await User.updateOne({
            _id: userId
        }, {
            $set: {
                userAvatar: imagekitImg,
                imageId: imageId
            }
        });
    } else {
        return image
    }
    return imagekitImg;
}

// Middleware to verify token
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const googleOAuthSignUp = async (req, res) => {
    const credential = req.body.credentialResponse.credential;
    const clientId = req.body.credentialResponse.clientId;
    const authSource = 'google';
    const password = null;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        const user = await User.signup(authSource, name, email, password);

        const token = createToken(user._id);

        res.status(201).json({ username: name, email, token, userId: user._id });

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message })
    }
}

const googleOAuthSignIn = async (req, res) => {
    const credential = req.body.credentialResponse.credential;
    const clientId = req.body.credentialResponse.clientId;
    const authSource = 'google';
    const password = null;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId
        });

        const payload = ticket.getPayload();
        const { email } = payload;

        const user = await User.login(authSource, email, password);

        const image = await isBase64(user._id, user.userAvatar);

        const token = createToken(user._id);

        res.status(200).json({username: user.username, email, token, userId: user._id, userAvatar: image})

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message })
    }
}

const signupUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const authSource = "local"
        const user = await User.signup(authSource, username, email, password)

        const token = createToken(user._id);

        res.status(201).json({ username: user.username , email, token, userId: user._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const authSource = "local";
    try {
        const user = await User.login(authSource, email, password);
        
        const token = createToken(user._id);

        const image = await isBase64(user._id, user.userAvatar);

        res.status(200).json({username: user.username, email, token, userId: user._id, userAvatar: image})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    signupUser,
    loginUser,
    googleOAuthSignIn,
    googleOAuthSignUp
}
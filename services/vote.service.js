const httpStatus = require("http-status");
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const config = require("../config/config");
const ApiError = require("../middlewares/ApiError");
const { Voter, Candidate } = require("../models");
const web3 = new Web3(config.blockchain.infuraUrl);

const createVote = async(voteBody) => {
    const {voterId, candidateId} = voteBody;
    if(!voterId || !candidateId){
        throw new ApiError(httpStatus.BAD_REQUEST, "VoterID and CandidateID are required");
    }
    const candidate = await Candidate.findOne({candidateId, accepted : 1});
    if(!candidate){
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate is not accepted");
    }
    if(await isVoted(voterId, candidate.type)){;
        throw new ApiError(httpStatus.BAD_REQUEST, `You have already voted for this ${candidate.type.toUpperCase()} type`);
    }
    const voter = await Voter.findOne({voterId});
    const partyName = candidate.partyName;
    const type = candidate.type;
    let area = null;
    if(type === "mp"){
        if(voter.district !== candidate.voterInfo.district){
            throw new ApiError(httpStatus.BAD_REQUEST, "Your district is not equal to Candidate district");
        }
        area = candidate.voterInfo.district;
    } else if(type === "mla"){
        if(voter.constituency !== candidate.voterInfo.constituency){
            throw new ApiError(httpStatus.BAD_REQUEST, "Your constituency is not equal to Candidate constituency");
        }
        area = candidate.voterInfo.constituency;
    } else if(type === "zptc"){
        if(voter.mandal !== candidate.voterInfo.mandal){
            throw new ApiError(httpStatus.BAD_REQUEST, "Your mandal is not equal to Candidate mandal");
        }
        area = candidate.voterInfo.mandal;
    } else if(type === "sarpanch"){
        if(voter.village !== candidate.voterInfo.village){
            throw new ApiError(httpStatus.BAD_REQUEST, "Your village is not equal to Candidate village");
        }
        area = candidate.voterInfo.village;
    }
    const abi = JSON.parse(config.blockchain.abi);
    const contract = new web3.eth.Contract(abi, config.blockchain.contract);
    const data = contract.methods.castVote(voterId, candidateId, partyName, type, area).encodeABI();
    let txObject = {};
    let responce = null;
    await web3.eth.getTransactionCount(config.blockchain.account).then(async(txCount) => {
        txObject = {
            nonce: web3.utils.toHex(txCount),
            gasLimit: web3.utils.toHex(800000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
            to: config.blockchain.contract,
            data: data
        };
        const tx = new Tx(txObject, { chain: 'rinkeby', hardfork: 'petersburg' });
        const privateKey = Buffer.from(config.blockchain.privateKey, "hex");
        tx.sign(privateKey);
        const serializedTx = tx.serialize();
        const raw = '0x' + serializedTx.toString('hex');
        await web3.eth.sendSignedTransaction(raw).then((txHash) => {
            responce = txHash;
        }).catch((error) => {
            throw new ApiError(httpStatus.NOT_FOUND, error);
        });
    }).catch((error) => {
        throw new ApiError(httpStatus.NOT_FOUND, error);
    });
    if(!responce.status){
        throw new ApiError(httpStatus.NOT_FOUND, "Unable to access Blockchain network, please wait for a while");
    }
    return responce;
};

const getVotesByVoterId = async(inputVoterId) => {
    const votes = [];
    const abi = JSON.parse(config.blockchain.abi);
    const contract = new web3.eth.Contract(abi, config.blockchain.contract);
    await contract.methods.votesCount().call().then(async(data) => {
        for(var i=1;i<=data;i++){
            await contract.methods.votes(i).call().then((data) => {
                const vote = {};
                const {voterId, candidateId, partyName, position, area} = data;
                if(voterId === inputVoterId){
                    const type = position;
                    Object.assign(vote,{voterId, candidateId, partyName, type, area});
                    votes.push(vote);
                }
            }).catch((error) => {
                throw new ApiError(httpStatus.NOT_FOUND, error);
            });
        }
    }).catch((error) => {
        throw new ApiError(httpStatus.NOT_FOUND, error);
    });
    return votes;
};

const isVoted = async(inputVoterId, type) => {
    const abi = JSON.parse(config.blockchain.abi);
    const contract = new web3.eth.Contract(abi, config.blockchain.contract);
    let flag = 0;
    await contract.methods.votesCount().call().then(async(data) => {
        for(var i=1;i<=data;i++){
            await contract.methods.votes(i).call().then((data) => {
                const {voterId, position} = data;
                if((inputVoterId === voterId) && (position === type)){
                    flag = 1;
                }
            }).catch((error) => {
                throw new ApiError(httpStatus.NOT_FOUND, error);
            });
            if(flag === 1){
                break;
            }
        }
    }).catch((error) => {
        throw new ApiError(httpStatus.NOT_FOUND, error);
    });
    if(flag === 1){
        return true;
    } else {
        return false;
    }
};

const queryVotes = async(req, res) => {
    const votes = [];
    const abi = JSON.parse(config.blockchain.abi);
    const contract = new web3.eth.Contract(abi, config.blockchain.contract);
    await contract.methods.votesCount().call().then(async(data) => {
        for(var i=1;i<=data;i++){
            await contract.methods.votes(i).call().then((data) => {
                const vote = {};
                const {voterId, candidateId, partyName, position, area} = data;
                const type = position;
                Object.assign(vote,{voterId, candidateId, partyName, type, area});
                votes.push(vote);
            }).catch((error) => {
                throw new ApiError(httpStatus.NOT_FOUND, error);
            });
        }
    }).catch((error) => {
        throw new ApiError(httpStatus.NOT_FOUND, error);
    });
    if(votes.length === 0){
        throw new ApiError(httpStatus.NOT_FOUND, "Empty Votes");
    }
    return votes;
};

const resultsByTypeAndArea = async(inputType, inputArea) => {
    const abi = JSON.parse(config.blockchain.abi);
    const contract = new web3.eth.Contract(abi, config.blockchain.contract);
    const votes = [];
    await contract.methods.votesCount().call().then(async(data) => {
        for(var i=1;i<=data;i++){
            await contract.methods.votes(i).call().then((data) => {
                const vote = {};
                const {voterId, candidateId, partyName, position, area} = data;
                const type = position;
                if((type === inputType) && (area === inputArea)){
                    Object.assign(vote,{voterId, candidateId, partyName, type, area});
                    votes.push(vote);
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }).catch((error) => {
        console.log(error);
    });
    const map = new Map();
    votes.forEach((vote) => {
        map.set(vote.candidateId, 1);
    });
    votes.forEach((vote) => {
        map.set(vote.candidateId, map.get(vote.candidateId) + 1);
    });
    const winners = [];
    var maxValue = (Math.max(...map.values()));
    map.forEach((count, candidateId) => {
        if(count === maxValue){
            count--;
            const responce = {
                candidateId,
                count
            };
            winners.push(responce);
        }
    });
    return winners;
};

module.exports = {
    createVote,
    getVotesByVoterId,
    isVoted,
    resultsByTypeAndArea,
    queryVotes
};

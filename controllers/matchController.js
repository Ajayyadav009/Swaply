const User = require('../models/User');

const calculateScore = (currentUser, candidateUser) =>{
    let score =0;
    const matchedSkills =[];
    const myTeaches = currentUser.teaches.map(s => s.name.toLowerCase());
    const myWants = currentUser.wantsToLearn.map(s => s.name.toLowerCase());
    const theirTeaches = candidateUser.teaches.map(s => s.name.toLowerCase());
    const theirWants = candidateUser.wantsToLearn.map(s => s.name.toLowerCase());


    myWants.forEach(skill => {
        if(theirTeaches.includes(skill)){
            score += 10;
            matchedSkills.push(skill);

        }
    });
    theirWants.forEach(skill =>{
        if(myWants.includes(skill)){
            score += 10;

        }
    });

    score = Math.min(score, 40);


    matchedSkills.forEach(skillName =>{
        const  myWantLevel = currentUser.wantsToLearn.find(
            s=> s.name.toLowerCase() === skillName
        )?.level;
         const theirTeachLevel  = candidateUser.teaches
         .find(s => s.name.toLowerCase() === skillName)?.level;

         if(theirTeachLevel === 'expert') score += 15;
         else if(theirTeachLevel === myWantLevel) score += 10;

    });

    score = Math.min(score , 70);

    const ratingBonus = candidateUser.rating * 6;
    score += ratingBonus;

    score = Math.min(Math.round(score), 100);

    return { score, matchedSkills };
};


const getMatches = async(req, res) =>{
    try{
        const currentUser = await User.findById(req.user._id);
        
        if(!currentUser.teaches.length || !currentUser.wantsToLearn.length){
            return res.status(400).json({
                message: "Please add Skills you teach and wants to Learn"
            });

        }
        const myTeachNames = currentUser.teaches.map(s=>s.name);
        const myWantNames = currentUser.wantsToLearn.map(s=>s.name);

        const candidates = await User.find({
            _id: { $ne: currentUser._id },
            'teaches.name': { $in: myWantNames },
            'wantsToLearn.name': { $in: myTeachNames }
        }).select('-password');

        if(candidates.length === 0){
            return res.status(200).json({
                count: 0,
                matches: []
            });
        }

        const scored = candidates.map(candidate => {
            const { score, matchedSkills } = calculateScore(currentUser, candidate);
            return {
                user: {
                    _id: candidate._id,
                    name: candidate.name,
                    bio: candidate.bio,
                    avatar: candidate.avatar,
                    teaches: candidate.teaches,
                    wantsToLearn: candidate.wantsToLearn,
                    rating: candidate.rating,
                    reviewCount: candidate.reviewCount
                },
                matchedSkills,
                score
            };
        });

        const ranked = scored.sort((a, b) => 
            b.score - a.score);
        res.status(200).json({
            count: ranked.length,
            matches: ranked
        });

    } catch(error){
        res.status(500).json({message: error.message});

    }
};
module.exports = { getMatches };

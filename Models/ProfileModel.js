var ProfileModel = function (ProfileInfoObject,SportsListObject,SportInterestsObject,JoinedTeamsObject, CreatedTeamsObject,UserMessageGroupInfoObject,CreatedLeaguesList) {
    
    this.ProfileInfo=ProfileInfoObject,
    this.SportsList=SportsListObject,
    this.SportsInterests=SportInterestsObject,
    this.JoinedTeamsList = JoinedTeamsObject,
    this.CreatedTeamsList = CreatedTeamsObject,
    this.UserMessageGroupInfo=UserMessageGroupInfoObject,
    this.CreatedLeaguesList=CreatedLeaguesList

};

module.exports = ProfileModel;
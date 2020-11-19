var ManageGameScheduleModel = function (GameScheduleObject,GameLocationObject, DivisionObject,TeamsObject,GameOfficialsObject) {
    
    this.GameScheduleData = GameScheduleObject,
      this.GameLocationsList = GameLocationObject,
      this.DivisionsList = DivisionObject,
      this.TeamsList = TeamsObject
      this.GameOfficialsList = GameOfficialsObject

  };

  module.exports = ManageGameScheduleModel; 
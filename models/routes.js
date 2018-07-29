'use strict';
module.exports = (sequelize, DataTypes) => {
  var Routes = sequelize.define('Routes', {
    token: DataTypes.STRING,
    status: DataTypes.STRING,
    path: DataTypes.STRING,
    distance: DataTypes.INTEGER,
    time: DataTypes.INTEGER
  }, {});
  Routes.associate = function(models) {
    // associations can be defined here
  };
  return Routes;
};
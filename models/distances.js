'use strict';
module.exports = (sequelize, DataTypes) => {
  var Distances = sequelize.define('Distances', {
    origin: DataTypes.STRING,
    destination: DataTypes.STRING,
    distance: DataTypes.INTEGER,
    time: DataTypes.INTEGER
  }, {});
  Distances.associate = function(models) {
    // associations can be defined here
  };
  return Distances;
};
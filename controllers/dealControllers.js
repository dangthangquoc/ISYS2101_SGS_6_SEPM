const Team = require('../models/team');

const estimateProfit = (initialBudget, period, yearlyInterest) => {
  const monthlyInterest = yearlyInterest / 12;

  return initialBudget * monthlyInterest * period;
};

module.exports.getDeals = async (req, res) => {
  const { initialBudget, targetProfit, period } = req.body;

  const allTeams = await Team.find();

  const deals = [];

  allTeams.forEach((team) => {
    let yearlyInterest;

    switch (parseInt(period)) {
      case 1:
        yearlyInterest = team.profit_1_month;
        break;
      case 3:
        yearlyInterest = team.profit_3_month;
        break;
      case 12:
        yearlyInterest = team.profit_12_month;
        break;
      default:
        yearlyInterest = team.profit_1_month;
    }

    const estimatedProfit = estimateProfit(
      initialBudget,
      period,
      yearlyInterest
    );

    if (targetProfit && estimatedProfit < targetProfit) return;

    deals.push({
      id: team._id,
      teamName: team.teamName,
      teamImage: team.teamImage,
      squadSize: team.squadSize,
      marketValue: team.marketValue,
      avgPlayerValue: team.avgPlayerValue,
      avgAge: team.avgAge,
      currentTransferRecord: team.transferRecord,
      estimatedProfit: parseFloat(estimatedProfit).toFixed(2),
    });
  });

  if (!targetProfit && deals.length > 0) {
    return res.json([deals[0]]);
  }

  res.json(deals.sort((a, b) => b.estimatedProfit - a.estimatedProfit));
};

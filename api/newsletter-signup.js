// Retired: the native newsletter form preserves ActiveCampaign double opt-in.
// Direct list subscription here bypassed that confirmation and is not supported.
module.exports = function handler(req, res) {
  res.setHeader('Allow', 'POST');
  return res.status(410).json({ error: 'This endpoint is retired. Please use /newsletter.' });
};

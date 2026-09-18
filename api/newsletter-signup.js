// Server-side proxy for ActiveCampaign newsletter signup
// Vercel API route - CommonJS format

const API_KEY = process.env.AC_API_KEY;
if (!API_KEY) {
  throw new Error('AC_API_KEY environment variable is required');
}
const API_BASE = 'https://kronusempire.api-us1.com/api/3';

const LIST_CONFIG = {
  kc: { listId: 4, tagId: 17 },
  kig: { listId: 5, tagId: 18 }
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, firstName, type } = req.body;
  
  if (!email || !type || !LIST_CONFIG[type]) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const config = LIST_CONFIG[type];
  
  try {
    const contactRes = await fetch(`${API_BASE}/contact/sync`, {
      method: 'POST',
      headers: {
        'Api-Token': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contact: {
          email,
          firstName: firstName || undefined
        }
      })
    });
    
    const contactData = await contactRes.json();
    
    if (!contactData.contact || !contactData.contact.id) {
      throw new Error('Contact sync failed');
    }
    
    const contactId = contactData.contact.id;
    
    await fetch(`${API_BASE}/contactLists`, {
      method: 'POST',
      headers: {
        'Api-Token': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactList: {
          list: config.listId,
          contact: contactId,
          status: 1
        }
      })
    });
    
    await fetch(`${API_BASE}/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: config.tagId
        }
      })
    });
    
    res.status(200).json({ success: true, contactId });
    
  } catch (err) {
    console.error('Newsletter signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

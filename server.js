const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/events', async (req, res) => {
  const { zip } = req.query;
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    console.error('Missing TICKETMASTER_API_KEY in environment variables.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key' });
  }

  if (!zip) {
    return res.status(400).json({ error: 'Zip code is required' });
  }

  try {
    // 1. First, try searching Ticketmaster with a wellness/health keyword near the entered zip code (50-mile radius)
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?postalCode=${zip}&radius=50&unit=miles&keyword=wellness&apikey=${apiKey}`;
    
    let response = await fetch(tmUrl);
    if (!response.ok) {
      throw new Error(`Ticketmaster API returned status ${response.status}`);
    }

    let data = await response.json();
    
    // 2. If the wellness keyword is too specific and returns 0 results for that zip, 
    // fetch general live events in that area so your users still get real events and active ticket links.
    if (!data._embedded || !data._embedded.events || data._embedded.events.length === 0) {
      const generalTmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?postalCode=${zip}&radius=50&unit=miles&apikey=${apiKey}`;
      const generalResponse = await fetch(generalTmUrl);
      
      if (generalResponse.ok) {
        data = await generalResponse.json();
      }
    }

    // Return the raw Ticketmaster JSON directly to selfcare.jsx
    return res.json(data);
  } catch (err) {
    console.error('Ticketmaster API Fetch Error:', err);
    return res.status(500).json({ error: 'Failed to fetch events from Ticketmaster' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
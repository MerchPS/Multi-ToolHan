// Vercel serverless function for JSONBin operations

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const JSONBIN_ACCESS_KEY = process.env.JSONBIN_ACCESS_KEY;

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Check API keys
    if (!JSONBIN_MASTER_KEY || !JSONBIN_ACCESS_KEY) {
        return res.status(500).json({ error: 'JSONBin API keys not configured' });
    }
    
    try {
        const { action, id, data } = req.body;
        
        switch (action) {
            case 'create':
                return await createBin(data, res);
            case 'get':
                return await getBin(id, res);
            case 'update':
                return await updateBin(id, data, res);
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('JSONBin API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Create a new bin
async function createBin(data, res) {
    try {
        const response = await fetch(JSONBIN_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Access-Key': JSONBIN_ACCESS_KEY,
                'X-Bin-Name': `multitools-storage-${data.id}`,
                'X-Bin-Private': 'true'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`JSONBin create error: ${error}`);
        }
        
        const result = await response.json();
        return res.status(200).json({ success: true, id: result.metadata.id });
    } catch (error) {
        console.error('Create bin error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// Get a bin by ID
async function getBin(id, res) {
    try {
        // First, try to find the bin by name
        const searchResponse = await fetch(`${JSONBIN_BASE_URL}/s?q=name:multitools-storage-${id}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Access-Key': JSONBIN_ACCESS_KEY
            }
        });
        
        if (!searchResponse.ok) {
            const error = await searchResponse.text();
            throw new Error(`JSONBin search error: ${error}`);
        }
        
        const searchResult = await searchResponse.json();
        
        if (!searchResult.record || searchResult.record.length === 0) {
            return res.status(404).json({ error: 'Storage not found' });
        }
        
        const binId = searchResult.record[0].id;
        
        // Now get the bin data
        const response = await fetch(`${JSONBIN_BASE_URL}/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Access-Key': JSONBIN_ACCESS_KEY
            }
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`JSONBin get error: ${error}`);
        }
        
        const result = await response.json();
        return res.status(200).json(result.record);
    } catch (error) {
        console.error('Get bin error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// Update a bin
async function updateBin(id, data, res) {
    try {
        // First, try to find the bin by name
        const searchResponse = await fetch(`${JSONBIN_BASE_URL}/s?q=name:multitools-storage-${id}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Access-Key': JSONBIN_ACCESS_KEY
            }
        });
        
        if (!searchResponse.ok) {
            const error = await searchResponse.text();
            throw new Error(`JSONBin search error: ${error}`);
        }
        
        const searchResult = await searchResponse.json();
        
        if (!searchResult.record || searchResult.record.length === 0) {
            return res.status(404).json({ error: 'Storage not found' });
        }
        
        const binId = searchResult.record[0].id;
        
        // Now update the bin
        const response = await fetch(`${JSONBIN_BASE_URL}/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Access-Key': JSONBIN_ACCESS_KEY
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`JSONBin update error: ${error}`);
        }
        
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Update bin error:', error);
        return res.status(500).json({ error: error.message });
    }
}
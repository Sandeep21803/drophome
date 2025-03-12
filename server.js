const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Store bookings in a JSON file
const BOOKINGS_FILE = 'bookings.json';

// Initialize bookings file if it doesn't exist
async function initializeBookingsFile() {
    try {
        await fs.access(BOOKINGS_FILE);
    } catch {
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify([]));
    }
}

// Helper function to read bookings
async function readBookings() {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper function to write bookings
async function writeBookings(bookings) {
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// Save booking
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = {
            id: `BK${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'pending',
            ...req.body
        };

        const bookings = await readBookings();
        bookings.push(booking);
        await writeBookings(bookings);

        res.status(201).json({ message: 'Booking saved successfully', booking });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ error: 'Failed to save booking' });
    }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await readBookings();
        res.json(bookings);
    } catch (error) {
        console.error('Error reading bookings:', error);
        res.status(500).json({ error: 'Failed to read bookings' });
    }
});

// Update booking status
app.patch('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const bookings = await readBookings();
        const bookingIndex = bookings.findIndex(b => b.id === id);

        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        bookings[bookingIndex] = {
            ...bookings[bookingIndex],
            ...req.body,
            id // Preserve the original ID
        };

        await writeBookings(bookings);
        res.json({ message: 'Booking updated successfully', booking: bookings[bookingIndex] });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bookings = await readBookings();
        const filteredBookings = bookings.filter(b => b.id !== id);

        if (filteredBookings.length === bookings.length) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        await writeBookings(filteredBookings);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

// Get booking statistics
app.get('/api/bookings/stats', async (req, res) => {
    try {
        const bookings = await readBookings();
        const today = new Date().toLocaleDateString();

        const stats = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            completed: bookings.filter(b => b.status === 'completed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            todayBookings: bookings.filter(b => 
                new Date(b.timestamp).toLocaleDateString() === today
            ).length,
            todayRevenue: bookings
                .filter(b => new Date(b.timestamp).toLocaleDateString() === today)
                .reduce((sum, b) => {
                    const fare = parseFloat(b.estimatedFare.replace('₹', '')) || 0;
                    return sum + fare;
                }, 0)
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting booking statistics:', error);
        res.status(500).json({ error: 'Failed to get booking statistics' });
    }
});

// Admin panel route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Initialize and start server
initializeBookingsFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Admin panel available at http://localhost:${PORT}/admin`);
    });
}); 
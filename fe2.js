const http = require('http');
const url = require('url');

const PORT = 5000;

// Function to handle requests and responses
const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/calculate') {
        let body = '';

        // Collect data from the request body
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Parse the JSON body
                const { totalClasses, attendancePercentage, endDate } = JSON.parse(body);

                // Validate input
                if (!totalClasses || !attendancePercentage || !endDate) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'All fields are required!' }));
                }

                // Calculate days left for the semester to end
                const today = new Date();
                const semesterEndDate = new Date(endDate);

                if (semesterEndDate <= today) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'End date must be in the future!' }));
                }

                const remainingDays = Math.ceil((semesterEndDate - today) / (1000 * 3600 * 24));
                const remainingWeeks = Math.floor(remainingDays / 7);

                // Attendance calculation
                const classesAttended = Math.round((attendancePercentage / 100) * totalClasses);
                const requiredClassesToReach75 = Math.ceil(0.75 * totalClasses) - classesAttended;

                if (requiredClassesToReach75 <= 0) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        message: 'You already have 75% or more attendance!',
                        remainingDays,
                        classesNeededPerDay: 0,
                    }));
                }

                // Calculate total classes available in remaining days
                const totalClassDays = remainingWeeks * 5 + (remainingDays % 7 >= 5 ? 5 : remainingDays % 7);
                const classesNeededPerDay = Math.ceil(requiredClassesToReach75 / totalClassDays);

                // Send response
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    remainingDays,
                    requiredClassesToReach75,
                    classesNeededPerDay,
                    message: `You need to attend ${classesNeededPerDay} classes per day to reach 75% attendance.`
                }));

            } catch (error) {
                // Handle JSON parsing errors
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid request data!' }));
            }
        });
    } else {
        // Handle unsupported routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found!' }));
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

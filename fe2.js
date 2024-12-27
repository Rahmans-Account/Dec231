<script>
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const resultTotalClasses = document.getElementById('result-total-classes');
    const resultAttendancePercentage = document.getElementById('result-attendance-percentage');
    const resultEndDate = document.getElementById('result-end-date');

    submitBtn.addEventListener('click', async () => {
        // Get form inputs
        const totalClasses = document.getElementById('total-classes').value;
        const attendancePercentage = document.getElementById('attendance-percentage').value;
        const endDate = document.getElementById('end-date').value;

        // Validate inputs
        if (!totalClasses || !attendancePercentage || !endDate) {
            alert('Please fill in all the fields.');
            return;
        }

        try {
            // Send data to the backend
            const response = await fetch('/.netlify/functions/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalClasses: Number(totalClasses),
                    attendancePercentage: Number(attendancePercentage),
                    endDate
                }),
            });

            // Parse and display results
            const data = await response.json();
            if (response.ok) {
                resultContainer.style.display = 'block';
                resultTotalClasses.textContent = `Remaining Days: ${data.remainingDays}`;
                resultAttendancePercentage.textContent = `Classes Needed to Reach 75%: ${data.requiredClassesToReach75}`;
                resultEndDate.textContent = `Classes Needed Per Day: ${data.classesNeededPerDay}`;
            } else {
                alert(data.message || 'An error occurred while calculating.');
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
        }
    });
</script>

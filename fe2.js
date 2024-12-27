exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { totalClasses, attendancePercentage, endDate } = JSON.parse(event.body);

    // Validate inputs
    if (!totalClasses || !attendancePercentage || !endDate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'All fields are required!' }),
      };
    }

    const today = new Date();
    const semesterEndDate = new Date(endDate);

    if (semesterEndDate <= today) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'End date must be in the future!' }),
      };
    }

    const remainingDays = Math.ceil((semesterEndDate - today) / (1000 * 3600 * 24));
    const remainingWeeks = Math.floor(remainingDays / 7);

    const classesAttended = Math.round((attendancePercentage / 100) * totalClasses);
    const requiredClassesToReach75 = Math.ceil(0.75 * totalClasses) - classesAttended;

    if (requiredClassesToReach75 <= 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          remainingDays,
          requiredClassesToReach75: 0,
          classesNeededPerDay: 0,
          message: 'You already have 75% or more attendance!',
        }),
      };
    }

    const totalClassDays = remainingWeeks * 5 + (remainingDays % 7 >= 5 ? 5 : remainingDays % 7);
    const classesNeededPerDay = Math.ceil(requiredClassesToReach75 / totalClassDays);

    return {
      statusCode: 200,
      body: JSON.stringify({
        remainingDays,
        requiredClassesToReach75,
        classesNeededPerDay,
        message: `You need to attend ${classesNeededPerDay} classes per day to reach 75% attendance.`,
      }),
    };
  } catch (error) {
    console.error('Error in function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

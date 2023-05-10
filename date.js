exports.getDate = getDate;

function getDate() {
    let today = new Date();
    const options = {
            weekday: "long",
            month: "long",
            day: "numeric",
    };
    let date = today.toLocaleString('en-GB', options);
    return date;
}
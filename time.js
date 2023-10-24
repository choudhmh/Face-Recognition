let myDate = new Date();
let hrs = myDate.getHours();

let greet;

if (hrs < 12)
    greet = 'Good Morning';
else if (hrs >= 12 && hrs <= 17)
    greet = 'Good Afternoon';
else if (hrs >= 17 && hrs <= 24)
    greet = 'Good Evening';

document.getElementById('greet').innerHTML = greet;
console.log(myDate);
document.getElementById('date').innerHTML = myDate;
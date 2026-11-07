import http from 'http';

http.get('http://localhost:3000/phone', res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP /phone status:', res.statusCode);
    console.log('Add Content button hidden for students:', body.includes('id="cd-modal-doctor-add-btn"') && body.includes('hidden text-[9px]'));
    console.log('Student authoring denied in script:', body.includes('Students cannot add or edit course materials'));
    console.log('Completed course submissions closed badge:', body.includes('Closed (Course Completed)'));
  });
}).on('error', err => console.error(err));

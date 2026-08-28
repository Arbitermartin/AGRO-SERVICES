/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('chatbot_faqs').del();
  await knex('chatbot_faqs').insert([
    { question: 'How do I register?', answer: 'Click "Join Our Network" on the homepage or navigation menu. If registration is currently open, you\'ll see the intake dates and payment details before starting the form.', keywords: 'register,registration,sign up,join,account' },
    { question: 'How do I apply for a job?', answer: 'Visit the Job Opportunities page, click on a listing to view details, then click "Apply Now" to submit your application with your CV.', keywords: 'job,apply,vacancy,employment,career,work' },
    { question: 'How do I register for training?', answer: 'Log in to your member dashboard, go to Training Programs, and click "Register Now" on any active training.', keywords: 'training,course,workshop,learn,program' },
    { question: 'What payment methods are accepted?', answer: 'We accept Mobile Money (M-Pesa, Tigo Pesa, Airtel Money) and Bank Transfer. Details are shown on the registration page when open.', keywords: 'payment,pay,money,mpesa,bank,transfer,cost,fee' },
    { question: 'How do I reset my password?', answer: 'On the login page, or from your dashboard, go to Change Password. If you cannot log in, ask me here and I can connect you with ICT support.', keywords: 'password,reset,forgot,login,cant login' },
    { question: 'How do I contact support?', answer: 'You can create a support ticket from your member dashboard, or ask me here and I\'ll connect you with an ICT agent if one is online.', keywords: 'support,help,contact,ticket,agent' },
    { question: 'How do I contact a live agent?', answer: 'Just ask me a question — if I can\'t answer it, I\'ll offer to connect you with an available ICT staff member for live chat.', keywords: 'live agent,human,real person,talk to someone,speak to agent' },
    { question: 'How do I check my job application status?', answer: 'Log in to your member dashboard and go to "My Applications" to see the status of every job you\'ve applied for.', keywords: 'application status,check my application,job status,applied' },
    { question: 'How do I view events?', answer: 'Upcoming events are listed on the homepage. Click on any event to see full details and register.', keywords: 'event,events,upcoming,youth summit,workshop event' },
    { question: 'How do I download training guides?', answer: 'Visit the Guidance & Training page and scroll to "Downloadable Guides" to view or download PDF resources.', keywords: 'guide,guides,download,pdf,resources,training material' },
    { question: 'How do I use the farm cost calculator?', answer: 'Visit the Farm Cost Calculator page from the menu. Select your region, district, crop, farm size, and farming method, then click Calculate to see your estimated costs and profit.', keywords: 'calculator,farm cost,cost calculator,estimate cost,farming budget' },
    { question: 'What does the farm cost calculator show?', answer: 'It shows your estimated seed, fertilizer, labor, machinery, and other input costs, plus expected production, revenue, profit, cost per acre, break-even price, and ROI.', keywords: 'calculator results,roi,profit,break even,cost breakdown,production estimate' },
    { question: 'Which crops does the calculator cover?', answer: 'The calculator covers common crops grown across Tanzania such as maize, rice, beans, coffee, avocado, mango, sugarcane, and sunflower, with costs specific to each region and district.', keywords: 'which crops,crop list,maize,rice,coffee,avocado,mango,sugarcane' },
  ]);
};

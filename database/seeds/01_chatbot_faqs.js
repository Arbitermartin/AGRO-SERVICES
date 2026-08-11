/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
   await knex('chatbot_faqs').del();
  await knex('chatbot_faqs').insert([
    { question: 'How do I register?', answer: 'Click "Join Our Team" on the homepage or navigation menu. Registration must currently be open — check the registration page for dates and payment details.', keywords: 'register,registration,sign up,join,account' },
    { question: 'How do I apply for a job?', answer: 'Visit the Job Opportunities page, click on a listing to view details, then click "Apply Now" to submit your application with your CV.', keywords: 'job,apply,vacancy,employment,career,work' },
    { question: 'How do I register for training?', answer: 'Log in to your member dashboard, go to Training Programs, and click "Register Now" on any active training.', keywords: 'training,course,workshop,learn,program' },
    { question: 'What payment methods are accepted?', answer: 'We accept Mobile Money (M-Pesa, Tigo Pesa, Airtel Money) and Bank Transfer. Details are shown on the registration page when open.', keywords: 'payment,pay,money,mpesa,bank,transfer,cost,fee' },
    { question: 'How do I reset my password?', answer: 'On the login page, or from your dashboard, go to Change Password. If you cannot log in, contact ICT support through this chat.', keywords: 'password,reset,forgot,login,cant login' },
    { question: 'How do I contact support?', answer: 'You can create a support ticket from your member dashboard, or use this chat to connect with an ICT agent if one is online.', keywords: 'support,help,contact,ticket,agent' },
  ]);
};

const nodemailer = require('nodemailer');
const config = require('../config')

exports.Activity = async function ( email, subject,headerMSG,headerMSG1, text) {
    
    let transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        // auth: {
        //     user: 'developer@espsofttech.com',
        //     pass: 'Yd32r&DXa'
        // },
      auth: {
         user: 'admin@silkyex.io',
         pass: 'Bhubaneswar@700'
     },
        tls: {
            rejectUnauthorized: false
        }
    });
    let mailOptions = {
        from: 'admin@silkyex.io',
        to: `${email}`,
        subject: subject,
        html: ` <body>
         <table cellspacing="0" cellpadding="0" width="100%" class="silkyexchangeemail" style=" max-width: 600px;;margin: auto;font-family: Inter,sans-serif;font-size: 14px;box-shadow: 0px 0px 10px 0px #ddd;">
            <tbody>
               <tr>
                  <td style="padding:20px 35px; text-align: center; background-color: #000;">
                     <a href="#" style="display:inline-block;margin:0 15px" target="_blank" ><img src="https://espsofttech.org/silky_exchange_developement/admin/images/logo.png" width="70" class="CToWUd" data-bit="iit"></a>
                     
                  </td>
               </tr>
               <tr>
                <td style="padding:25px 36px 0px 36px;font: 500 0.9rem 'Lato', sans-serif;" align="left"><h1>${headerMSG}</h1></td>
               </tr>
               <tr>
                  <td style="padding:15px 36px;font: 500 0.9rem 'Lato', sans-serif;" align="left" >
                     <p style="margin:0 0 18px;color:#212529;line-height:28px;font-size:16px">Dear ${email},</p>
                     <p style="margin:0px;color:#212529;line-height:28px;font-size:16px;word-wrap:break-word">${headerMSG1}</p>
                  </td>
               </tr>
               <tr>
               <td style="padding:20px 15px 30px 15px;font: 500 0.9rem 'Lato', sans-serif;" align="center">
               ${text}
               </td>
               </tr>
               <tr>
             
                  <td style="padding:20px 15px 30px 15px;font: 500 0.9rem 'Lato', sans-serif;" align="center">
                     <a href="https://silkyex.io/" style="display:inline-block;font-size:16px;width:60%;padding:16px 0;background: linear-gradient(80deg, #bd8320, #1a1a1a);border-radius:10px;color:#fff;text-decoration:none" target="_blank" >Click Here to Explore the Platform</a>
                  </td>
               </tr>
               <tr>
                  <td style="padding:15px 36px; font: 500 0.9rem 'Lato', sans-serif;border-top: 1px solid #ddd;" align="left">
                     <p style="margin-top:10px;color:#212529;line-height:25px;font-size:16px;font-weight:500;text-align:justify">Regards,<br>Team silkyexchange</p>
                  </td>
               </tr>
          
               <tr>
                  <td style="background:#000;padding:15px;font: 500 0.9rem 'Lato', sans-serif;" align="center">
                     <p style="margin:0;color:#fff">Please reach out to <a href="#" style="text-decoration:none;color:#bd8320" target="_blank">support@silkyexchange.com</a> for any queries</p>
                     <font color="#888888">
                     </font>
                  </td>
               </tr>
            </tbody>
         </table>
         </body>
`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return false;
        } else {
            console.log('Email sent: ' + info.response);
            return true;
        }
    });
}
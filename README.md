# sails-hook-email-without-ejs

> ### There are no updates planned for this hook for Sails v1.0 and beyond.
>
> Feel free to continue to use this hook in existing projects, as-is, as long as it's doing the job for you.
> Just note that it's no longer the approach the Sails core team uses for new apps.
> Instead, we are now recommending the approach for sending emails that is bundled as part of `sails new` in Sails v1.
>
> To try that out, run `sails new foo --caviar` using Sails >= v1.0 and Node <= v7.9.
>
> _If you're unsure or need advice, visit https://sailsjs.com/support._



Email hook for [Sails JS](http://sailsjs.org), using [Nodemailer](https://github.com/andris9/Nodemailer/blob/v1.3.4/README.md)

*Note: This requires Sails v0.10.6+.*

### Installation

`npm install sails-hook-email-without-ejs`

### Usage

`sails.hooks['email-without-ejs'].send(options, cb)`

Parameter      | Type                | Details
-------------- | ------------------- |:---------------------------------
options        | ((object))          | Email sending options (see [Nodemailer docs](https://github.com/andris9/Nodemailer/blob/v1.3.4/README.md#e-mail-message-fields))
cb             | ((function))        | Callback to be run after the email sends (or if an error occurs).

### Configuration

By default, configuration lives in `sails.config['email-without-ejs']`.  The configuration key (`email-without-ejs`) can be changed by setting `sails.config.hooks['sails-hook-email-without-ejs'].configKey`.

Parameter      | Type                | Details
-------------- | ------------------- |:---------------------------------
service        | ((string)) | A "well-known service" that Nodemailer knows how to communicate with (see [this list of services](https://github.com/andris9/nodemailer-wellknown/blob/v0.1.5/README.md#supported-services))
auth | ((object)) | Authentication object as `{user:"...", pass:"..."}`
transporter | ((object)) | Custom transporter passed directly to nodemailer.createTransport (overrides service/auth) (see [Available Transports](https://github.com/andris9/Nodemailer/blob/v1.3.4/README.md#available-transports))
from | ((string)) | Default `from` email address
testMode | ((boolean)) | Flag indicating whether the hook is in "test mode".  In test mode, email options and contents are written to a `.tmp/email.txt` file instead of being actually sent.  Defaults to `true`.
alwaysSendTo | ((string)) | If set, all emails will be sent to this address regardless of the `to` option specified.  Good for testing live emails without worrying about accidentally spamming people.

#### Example

```javascript
// [your-sails-app]/config/email-without-ejs.js
module.exports['email-without-ejs'] = {
  service: 'Gmail',
  auth: {user: 'foobar@gmail.com', pass: 'emailpassword'},
  testMode: true
};

```

### Example

Given the following **testEmail.ejs** file contained in the folder **views/emailTemplates**:

```
<p>Dear <%=recipientName%>,</p>
<br/>
<p><em>Thank you</em> for being a friend.</p>
<p>Love,<br/><%=senderName%></p>
```

executing the following command (after [configuring for your email service](https://github.com/hkbu-kennycheng/sails-hook-email-without-ejs/#configuration) and turning off test mode) :

```
sails.hooks['email-without-ejs'].send({
    to: "joe@example.com",
    subject: "Hi there",
    html: await sails.reanderView('emailTemplates/testEmail', {
        recipientName: "Joe",
        senderName: "Sue",
        layout: false
    })
},function(err) {console.log(err || "It worked!")})
```

will result in the following email being sent to `joe@example.com`

> Dear Joe,
>
> *Thank you* for being a friend.
>
> Love,
>
> Sue

with an error being printed to the console if one occurred, otherwise "It worked!".

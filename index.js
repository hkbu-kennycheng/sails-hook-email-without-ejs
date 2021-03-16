/**
 * Module dependencies
 */

var nodemailer = require('nodemailer');
var htmlToText = require('nodemailer-html-to-text').htmlToText;
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');

/**
 * Email Hook
 *
 * Integration with relevant parts of the nodemailer API.
 *
 * For a full list of available email options see:
 * https://github.com/andris9/Nodemailer#e-mail-message-fields
 *
 * @param  {App} sails
 * @return {Object}
 * @hook
 */

module.exports = function Email(sails) {

  var transport;
  var self;

  return {

    /**
     * Default configuration
     * @type {Object}
     */
    defaults: {
      __configKey__: {
        service: 'Gmail',
        auth: {
          user: 'myemailaddress@gmail.com',
          pass: 'mypassword'
        },
        from: 'noreply@hydra.com',
        testMode: true
      }
    },

    configure: function () {
    },


    /**
     * @param  {Function} cb
     */
    initialize: function (cb) {
      self = this;

      if (sails.config[self.configKey].testMode) {
        transport = {
          sendMail: function (options, cb) {

            // Add sent timestamp
            options.sentAt = new Date();

            // First check the .tmp directory exists
            fs.exists(path.join(sails.config.appPath, '.tmp'), function (status) {
              if (!status) {
                fs.mkdir(path.join(sails.config.appPath, '.tmp'), function (err) {
                  if (err) return cb(err);
                  fs.appendFile(path.join(sails.config.appPath, '.tmp/email.txt'), JSON.stringify(options) + "\n", cb);
                });
                return;
              }

              // Otherwise just write to the .tmp/email.txt file
              fs.appendFile(path.join(sails.config.appPath, '.tmp/email.txt'), JSON.stringify(options) + "\n", cb);
            });
          }
        };
        return cb();
      } else {

        try {
          if (sails.config[self.configKey].transporter) {
            // If custom transporter is set, use that first
            transport = nodemailer.createTransport(sails.config[self.configKey].transporter);
          } else {
            // create reusable transport method (opens pool of SMTP connections)
            var smtpPool = require('nodemailer-smtp-pool');
            transport = nodemailer.createTransport(smtpPool({
              service: sails.config[self.configKey].service,
              auth: sails.config[self.configKey].auth
            }));
          }

          // Auto generate text
          transport.use('compile', htmlToText());
          return cb();
        }
        catch (e) {
          return cb(e);
        }

      }
    },

    /**
     * Send an email.
     * @param  {Object}   options (email options including to, from, html, text, etc)
     * @param  {Function} cb
     */

    send: function (options, cb) {

      // Set some default options
      var defaultOptions = {
        from: sails.config[self.configKey].from
      };

      sails.log.verbose('EMAILING:', options);

      async.auto({

            // Send the email
            sendEmail: function (next) {

              // `options`, e.g.
              // {
              //   to: 'somebody@example.com',
              //   from: 'other@example.com',
              //   subject: 'Hello World'
              // }
              var mailOptions = _.defaults(options, defaultOptions);
              mailOptions.to = sails.config[self.configKey].alwaysSendTo || mailOptions.to;

              transport.sendMail(mailOptions, next);
            }

          },

          // ASYNC callback
          function (err, results) {
            if (err) return cb(err);
            cb(null, results.sendEmail);
          });
    }

  };
};

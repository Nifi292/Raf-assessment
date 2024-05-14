/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 * 
 * ****************************
 * Author: Jobin and Jismi
 * 
 * Date created: 14/05/2024
 * 
 * Created BY: Nifi C Joy, Jobin and Jismi IT Services
 * 
 * Description: Suitelett script to create external custom record and perform various actions on it
 * 
 * REVISION HISTORY: 
 * 
 * *****************************
 **/

define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/email'],
    function (serverWidget, search, record, email) {
        function onRequest(scriptContext) {
            try {
                if (scriptContext.request.method === 'GET') {
                    var form = serverWidget.createForm({
                        title: 'Customer Information Form'
                    });
                    var cname = form.addField({
                        id: 'custpage_jj_name',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Customer Name'
                    });
                    cname.isMandatory = true;
                    var cemail = form.addField({
                        id: 'custpage_jj_email',
                        type: serverWidget.FieldType.EMAIL,
                        label: 'Email'
                    });
                    cemail.isMandatory = true;
                    var subject = form.addField({
                        id: 'custpage_jj_subject',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Subject'
                    });
                    var message = form.addField({
                        id: 'custpage_jj_message',
                        type: serverWidget.FieldType.TEXTAREA,
                        label: 'Message'
                    });
                    form.addSubmitButton({
                        label: 'Submit'
                    });
                    scriptContext.response.writePage(form);
                }
                else if (scriptContext.request.method === 'POST') {

                    var cname = scriptContext.request.parameters.custpage_jj_name;
                    var cemail = scriptContext.request.parameters.custpage_jj_email;
                    var subject = scriptContext.request.parameters.custpage_jj_subject;
                    var message = scriptContext.request.parameters.custpage_jj_message;
                    var customer = '';
                    var salesRepId = '';

                    var customerSearch = search.create({
                        type: search.Type.CUSTOMER,
                        filters: [['email', 'is', cemail]]
                    });

                    var searchResults = customerSearch.run().getRange({ start: 0, end: 1 });
                    if (searchResults && searchResults.length > 0) {
                        var customerId = searchResults[0].id;
                        customer = customerId;
                        var cRecord = record.load({
                            type: 'customer',
                            id: customerId,
                            isDynamic: false
                        });
                        customer = cRecord.getValue({
                            fieldId: 'entityid'
                        });
                        salesRepId = cRecord.getValue({
                            fieldId: 'salesrep'
                        });

                    } else {
                        customer = 'Null';
                        log.debug('No matching customer found.');
                    }

                    var salesrepemail = '';
                    if (salesRepId) {
                        var salereprecord = record.load({
                            type: 'employee',
                            id: salesRepId,
                            isDynamic: false
                        });
                        salesrepemail = salereprecord.getValue({
                            fieldId: 'email'
                        });
                    } else {
                        log.debug('Sales Rep ID not found. Unable to load employee record.');
                    }

                    var customRecId = createCustomRecord(cname, cemail, customer, subject, message);
                    log.debug('customRecId', customRecId);
                    // Display the entered details
                    var detailsHtml = '<h2>Customer Details</h2>';
                    detailsHtml += '<p><b>Customer Name:</b> ' + cname + '</p>';
                    detailsHtml += '<p><b>Customer email:</b> ' + cemail + '</p>';
                    detailsHtml += '<p><b>Customer (Reference to Customer):</b> ' + customer + '</p>';
                    detailsHtml += '<p><b>Subject:</b> ' + subject + '</p>';
                    detailsHtml += '<p><b>Message:</b> ' + message + '</p>';
                    detailsHtml += '<p><b>Custom created Customer record id:</b>' + customRecId + '</p>';

                    scriptContext.response.write(detailsHtml);

                    if (salesrepemail) {
                        email.send({
                            author: -5,
                            recipients: salesRepId,
                            subject: subject,
                            body: message,
                            relatedRecords: {
                                entityId: customRecId
                            }
                        });
                    } else {
                        log.debug('Sales representative email is missing. Email not sent.');
                    }

                    var emailobj = email.send({
                        author: -5,
                        recipients: -5,
                        subject: subject,
                        body: message,
                        relatedRecords: {
                            entityId: customRecId
                        }
                    });
                }
            } catch (e) {
                log.error("Error", e);
                scriptContext.response.write("An error occurred: " + e.message);
            }
        }

        function createCustomRecord(cname, cemail, customer, subject, message) {
            try {
                log.debug('name', cname);
                var customRecord = record.create({ type: 'customrecord102', isDynamic: true });
                customRecord.setValue({
                    fieldId: 'custrecord125',
                    value: cname
                });
                customRecord.setValue({
                    fieldId: 'custrecord126',
                    value: cemail
                });
                customRecord.setValue({
                    fieldId: 'custrecord127',
                    value: customer
                });
                customRecord.setValue({
                    fieldId: 'custrecord128',
                    value: subject
                });
                customRecord.setValue({
                    fieldId: 'custrecord129',
                    value: message
                });

                var recordId = customRecord.save({ ignoreMandatoryFields: false, enableSourcing: true });
                log.debug("record id", recordId);
                return recordId;
            } catch (e) {
                log.error("Error creating custom record", e);
                throw e;
            }
        }
        return {
            onRequest: onRequest
        };
    }
);

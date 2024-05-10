/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/http', 'N/url'], function (serverWidget, http, url) {

    function onRequest(context) {
        if (context.request.method === 'GET') {

            var form = serverWidget.createForm({
                title: 'University List'
            });


            var countryField = form.addField({
                id: 'custpage_country',
                type: serverWidget.FieldType.SELECT,
                label: 'Country',
                isMandatory: true
            });

            countryField.addSelectOption({
                value: 'India',
                text: 'India'
            });
            countryField.addSelectOption({
                value: 'China',
                text: 'China'
            });
            countryField.addSelectOption({
                value: 'Japan',
                text: 'Japan'
            });



            var sublist = form.addSublist({
                id: 'custpage_university_sublist',
                type: serverWidget.SublistType.LIST,
                label: 'Universities'
            });
            sublist.addField({
                id: 'custpage_country',
                type: serverWidget.FieldType.TEXT,
                label: 'Country'
            });
            sublist.addField({
                id: 'custpage_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });
            sublist.addField({
                id: 'custpage_state',
                type: serverWidget.FieldType.TEXT,
                label: 'State/Province'
            });
            sublist.addField({
                id: 'custpage_web_pages',
                type: serverWidget.FieldType.URL,
                label: 'Web Pages'
            });


            form.addSubmitButton({
                label: 'Submit'
            });


            context.response.writePage(form);
        } else if (context.request.method === 'POST') {

            var country = context.request.parameters.custpage_country;


            var apiUrl = 'http://universities.hipolabs.com/search?country=' + country;
            var response = http.get({
                url: apiUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            log.debug('Response Body:', response.body);

            var universities = JSON.parse(response.body);


            log.debug('Universities Data:', universities);



            var form = serverWidget.createForm({
                title: 'University List'
            });


            var sublist = form.addSublist({
                id: 'custpage_university_sublist',
                type: serverWidget.SublistType.LIST,
                label: 'Universities'
            });
            sublist.addField({
                id: 'custpage_country',
                type: serverWidget.FieldType.TEXT,
                label: 'Country'
            });
            sublist.addField({
                id: 'custpage_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });
            sublist.addField({
                id: 'custpage_state',
                type: serverWidget.FieldType.TEXT,
                label: 'State/Province'
            });
            sublist.addField({
                id: 'custpage_web_pages',
                type: serverWidget.FieldType.URL,
                label: 'Web Pages'
            });

            for (var i = 0; i < universities.length; i++) {
                var university = universities[i];
                log.debug('university', university);
                log.debug('university1', university["state-province"]);
                sublist.setSublistValue({
                    id: 'custpage_country',
                    line: i,
                    value: university.country || ""
                });
                sublist.setSublistValue({
                    id: 'custpage_name',
                    line: i,
                    value: university.name || ""
                });
                sublist.setSublistValue({
                    id: 'custpage_state',
                    line: i,
                    value: university["state-province"] || null
                });
                sublist.setSublistValue({
                    id: 'custpage_web_pages',
                    line: i,
                    value: university.web_pages || ""
                });
            }


            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };
});

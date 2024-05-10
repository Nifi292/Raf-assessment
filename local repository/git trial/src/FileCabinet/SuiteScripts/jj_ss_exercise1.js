/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["datecreated", "onorbefore", "yesterday"],
                        "AND",
                        ["anylineitem", "anyof", "396"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "entity", label: "Name" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });

            salesorderSearchObj.run().each(function (result) {
                let salesOrderRecord = record.load({
                    type: record.Type.SALES_ORDER,
                    id: result.id,
                    isDynamic: true
                });
                const lineCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
                for (let i = 0; i < lineCount; i++) {

                    var itemtype = salesOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype',
                        line: i
                    });
                    if (itemtype !== 'EndGroup') {


                        salesOrderRecord.selectLine({ sublistId: 'item', line: i });
                        salesOrderRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'isclosed', value: true });
                        salesOrderRecord.commitLine({ sublistId: 'item' });
                    }
                }
                salesOrderRecord.save();
                log.debug('deleted0', result.id)
                return true;
            })

        }

        return { execute }

    });

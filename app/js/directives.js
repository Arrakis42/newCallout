'use strict';

/* Directives */


var ngModule = angular.module('myApp.directives', []);

ngModule.directive('myDataTable', function()
{
    return function(scope, element, attrs)
    {

        var options = {};

        // apply DataTable passed options
        if (attrs.myDataTable.length > 0)
        {
            options = scope.$eval(attrs.myDataTable);
        }
        else
        {
            //use default options if none specified by the user
            options =
            {
                "sDom": "<'row well-margin-fix'<'span6'r>>t<'row'<'span4'i><'span4'l><'span4'p>>", //"<'row well-margin-fix'<'span6'r>>t<'row'<'span6'i><lp>>",   // setup the different pieces
                "sPaginationType": "bootstrap",
                "oLanguage":
                {
                    "sLengthMenu": "_MENU_ records per page"
                },
                "iDisplayLength": 25,
                "aLengthMenu": [[25],[50],[100]]
            };
        }

        //check if sorting option was passed
        if(attrs.aaSorting)
        {
            options["aaSorting"] = scope.$eval(attrs.aaSorting);
        }
        else
        {
            //if not default it
            options["aaSorting"] = [[0,'asc']];
        }

        //check to see if we should use the datatable serverside ajax data management
        if(attrs.serverSide)
        {
            options["bProcessing"]= true;
            options["bServerSide"]= true;
            options["sAjaxSource"] = scope.$eval(attrs.serverSide);
        }

        //Check to see if we specify the columns so use in datatables
        if (attrs.aoColumns)
        {
            options["aoColumns"] = scope.$eval(attrs.aoColumns);
        } else
        {
            //since we didn't specify the columns try to derive them
            var explicitColumns = [];
            var decalaredCols = element.find('.dtColHeaders');
            if(decalaredCols.length > 0)
            {
                decalaredCols.first().find('th').each(function(index, elem)
                {
                    explicitColumns.push($(elem).text());
                });
            }
            options["aoColumns"] = explicitColumns;
        }

        // aoColumnDefs is dataTables way of providing fine control over column config
        if (attrs.aoColumnDefs)
        {
            options["aoColumnDefs"] = scope.$eval(attrs.aoColumnDefs);
        }

        // apply the plugin
        var dt = element.dataTable(options);

        //If we pass column filter plugin options then intialze that plugin
        if(attrs.columnFilterOptions)
        {
            element.dataTable().columnFilter(scope.$eval(attrs.columnFilterOptions));
        }

        //If we are not using datatables server side functionality then we can use attrs.aaData and maintain it using a watch
        if(!attrs.serverSide && attrs.aaData)
        {
            // watch for any changes to our data, rebuild the DataTable
            scope.$watch(attrs.aaData, function(value)
            {
                var val = value || null;
                if (val) {
                    dt.fnClearTable();
                    dt.fnAddData(scope.$eval(attrs.aaData));
                }
            });
        }
    };
});




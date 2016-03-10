/// <reference path="../../typediff/mytypes.d.ts" />
 
Polymer('is-cascading-ddl', {

    ready: function(){
        this.$.list_container.setAttribute(this.layout_type, "");
    },

    item_selectedChanged: function (oldValue, newValue) {
        this.create_item_select(newValue);
        this.new_id = newValue;
    },
    create_item_select: function (new_id) {
        this.$.list_container.innerHTML = "";

        function get_ids(list, start_id, end_id, arr = []) {
            var item: any = {};
            if (start_id != end_id) {
                item = _.find(list,(item: any) => {
                    return item._id == start_id;
                });
                arr.push(item.parentId.toString());
            } else {
                item.parentId = end_id;
                arr = _.union(arr, [end_id]);
            }
            if (item.parentId == end_id) {
                return arr;
            } else {
                return get_ids(list, item.parentId, end_id, arr);
            }
        }

        function create_element(list, label_text, myThis) {
            var paper_dropdown_menu: any = document.createElement('is-ddl');
            paper_dropdown_menu.setAttribute('label', label_text);
            paper_dropdown_menu.style.height = '50px';
            paper_dropdown_menu.setAttribute('selected', "{{item_selected}}");
            paper_dropdown_menu.setAttribute('selectedid', "{{item_selected_id}}");
            paper_dropdown_menu.setAttribute('layout', "");
            paper_dropdown_menu.setAttribute('horizontal', "");
            //paper_dropdown_menu.setAttribute('max-height', "90%");
            if (myThis.layout_type == "horizontal") {
                paper_dropdown_menu.setAttribute('flex', "");
                paper_dropdown_menu.style.marginRight = '10px';
                paper_dropdown_menu.style.maxWidth = '500px';
                paper_dropdown_menu.style.marginBottom = '20px';
            } else {
                paper_dropdown_menu.style.marginTop = '0';
                paper_dropdown_menu.style.marginBottom = '0';
            }
            paper_dropdown_menu.list = list;
            return paper_dropdown_menu;
        }

        function update_list(list, id) {
            list = _.filter(list,(item: any) => {
                return item.parentId == id;
            });
            list.unshift({ text: "[all]", _id: id });
            return list;
        }

        function append_elements(list, ids_array, myThis) {

            var list_new = update_list(list, ids_array[ids_array.length - 1]);
            var label_text = myThis.place_holder;
            if (ids_array.length > 1) {
                var item = _.find(list,(item: any) => {
                    return item._id == ids_array[ids_array.length - 2];
                });
                label_text = item.text;
            }
            if (list_new.length > 1) {
                var paper_dropdown_menu = create_element(list_new, label_text, myThis);
                paper_dropdown_menu.addEventListener("selected_updated",(id) => {
                    myThis.item_selected = paper_dropdown_menu.selected;
                });

                myThis.$.list_container.appendChild(paper_dropdown_menu);
            }
            if (ids_array.length > 1) {
                ids_array.pop()
                return append_elements(list, ids_array, myThis);
            } else {
                return true;
            }

        }


        var ids_array = get_ids(this.list, new_id, this.limit_id, [new_id.toString()]);


        append_elements(this.list, ids_array, this)

    },
}); 
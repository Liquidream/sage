// External functions list
EXTERNAL get_time()
EXTERNAL ext_pickup_prop(prop_id)

=== function ext_pickup_prop(prop_id) ===
~ return "(no external function found)"

=== function get_time() ===
~ return "(no external function found)"

=== function test()
Testing!!!

=== function pickup_item(strItem)
PICKUP!!!
~ temp item = string_to_list(strItem, Props)
~   Inventory += item

=== function drop_item(strItem)
~ temp item = string_to_list(strItem, Props)
~   Inventory -= item

/*
	Converts a string to the corresponding list element from a particular list. Note the element doesn't need to be in the list variable at that moment in time! 

	Useful for sending parameters into the ink from the game: the game can store and pass in the string ID of the list element as a parameter.

	Returns the empty list () if the element isn't found.

	Usage: 

	LIST capitalCities = Paris, London, NewYork

	~ temp thisCity = string_to_list("Paris", capitalCities)
	~ capitalCities += thisCity
	I've now visited {thisCity}.

    UPDATE: Tweaked from snippet - as not using the external portion
*/

=== function string_to_list(stringElement, listSource)
    //~ temp retVal = STRING_TO_LIST(stringElement) 
    //{ USED_STRING_TO_LIST_FALLBACK:
    	~ temp retVal = stringAsPickedFromList(stringElement, LIST_ALL(listSource) ) 
    //}
     ~ return retVal

// fallback system: recurse through the listToTry, trying to string match the element name
=== function stringAsPickedFromList(stringElement, listToTry)
    ~ temp minElement = LIST_MIN(listToTry) 
    {minElement:
        { stringElement == "{minElement}":
            ~ return minElement
        }
        ~ return stringAsPickedFromList(stringElement, listToTry - minElement)
    }       
    ~ return () 


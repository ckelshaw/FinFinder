import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../supabaseClient';

function RiverDropdown({ onSelect, reset }) {
  const [rivers, setRivers] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]);

  useEffect(() => {
    async function fetchRivers() {
      const { data, error } = await supabase
        .from("rivers")
        .select();
      if (error) {
        console.error("Error fetching rivers: ", error.message);
      } else {
        const options = data.map((river) => ({
          value: river.id,
          label: river.river_name,
        }));
        setRivers(options);
      }
    }
    if(reset){
        console.log("resetting!")
        setSelectedOption(null);
    }
    fetchRivers();
  }, [reset]);

  return (
    <Select
      options={rivers}
      value={selectedOption}
      onChange={(selected) => {
        if(selected) {
            setSelectedOption(selected)
            onSelect(selected)
        } else {
            onSelect(null);
        }}}
      placeholder="Search for a river..."
      isClearable
    />
  );
}

export default RiverDropdown;

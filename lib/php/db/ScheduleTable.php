<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ScheduleTable
 *
 * @author zmiller
 */
class ScheduleTable extends BaseTable {
    
    public function select($userId, $rpiId = null, $scheduleId = null) {
        $filter = $this->createAndEqualsFilter(
                array(
                    "user_id" => $this->escape($userId),
                    "rpi_id" => $this->escape($rpiId), 
                    "id" => $this->escape($scheduleId)
                )
        );
        
        $sql = 
<<<EOD
            SELECT 
                schedule.id,
                schedule.name,
                rpi.id AS rpi, 
                schedule.zone,
                schedule.start,
                schedule.duration,
                schedule.dow
            FROM schedule
            LEFT JOIN rpi ON (rpi_id = rpi.id)
            WHERE $filter;
                
EOD;
        return $this->execute($sql);
    }
    
    public function insert($rpi, $name, $zone, $start, $duration, $dow) {
        $name = $this->escape($name);
        $rpi = $this->escape($rpi);
        $zone = $this->escape($zone);
        $start = $this->escape($start);
        $duration = $this->escape($duration);
        $dow = $this->escape($dow);
        
        $sql = 
<<<EOD
            INSERT INTO schedule
            (name, rpi_id, zone, start, duration, dow, created_date)
            VALUES
            ('$name', '$rpi', '$zone', '$start', '$duration', '$dow', NOW());
EOD;
        
    return $this->execute($sql);
    }
}

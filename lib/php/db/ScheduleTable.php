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
    

    public function delete($userId, $rpiId = null, $scheduleId = null) {
        $filter = $this->createAndEqualsFilter(array(
            "user" => $this->escape($userId), 
            "rpi_id" => $this->escape($rpiId), 
            "id" => $this->escape($scheduleId)));
        
        $sql = 
<<<EOD
            DELETE 
            FROM schedule
            WHERE $filter;
                
EOD;
        return $this->execute($sql);
    }
    
    public function select($userId, $rpiId = null, $scheduleId = null, $zone = null) {
        $filter = $this->createAndEqualsFilter(
                array(
                    "user" => $this->escape($userId),
                    "rpi_id" => $this->escape($rpiId), 
                    "id" => $this->escape($scheduleId),
                    "zone" => $this->escape($zone)
                )
        );
        
        $sql = 
<<<EOD
            SELECT 
                *
            FROM schedule
            WHERE $filter;
                
EOD;
        return $this->execute($sql);
    }
    
    public function insert($user, $rpi, $name, $zone, $start, $duration, $dow) {
        $user = $this->escape($user);
        $name = $this->escape($name);
        $rpi = $this->escape($rpi);
        $zone = $this->escape($zone);
        $start = $this->escape($start);
        $duration = $this->escape($duration);
        $dow = $this->escape($dow);
        
        $sql = 
<<<EOD
            INSERT INTO schedule
            (user, name, rpi_id, zone, start, duration, dow, created_date)
            VALUES
            ('$user', '$name', '$rpi', '$zone', '$start', '$duration', '$dow', NOW());
EOD;
        
    return $this->execute($sql);
    }
    
    public function update($user, $schedule, $rpi, $name, $zone, $start, $duration, $dow) {
        $user = $this->escape($user);
        $name = $this->escape($name);
        $rpi = $this->escape($rpi);
        $zone = $this->escape($zone);
        $start = $this->escape($start);
        $duration = $this->escape($duration);
        $dow = $this->escape($dow);
        
        $sql = 
<<<EOD
            UPDATE schedule
            SET
                name = '$name',
                rpi_id = '$rpi',
                zone = '$zone',
                start = '$start',
                duration = '$duration',
                dow = '$dow'
            WHERE
            user = '$user'
            AND id = '$schedule';
EOD;
        
    return $this->execute($sql);
    }
}

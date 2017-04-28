<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of RPiTable
 *
 * @author zmiller
 */
class RPiTable extends BaseTable {

    public function select($userId, $rpiId = null) {
        $filter = $this->createAndEqualsFilter(array(
            "user_id" => $this->escape($userId), 
            "id" => $this->escape($rpiId)));
        
        $sql = 
<<<EOD
            SELECT 
                id,
                user_id,
                last_status_update,
                created_date,
                CASE
                    WHEN
                        last_status_update IS NULL
                            OR (NOW() - INTERVAL 30 MINUTE > last_status_update)
                    THEN
                        'offline'
                    WHEN (NOW() - INTERVAL 15 MINUTE > last_status_update) THEN 'unknown'
                    ELSE 'online'
                END AS status
            FROM
                rpi
            WHERE $filter;
                
EOD;
        return $this->execute($sql);
    }

    public function delete($userId, $rpiId = null) {
        $filter = $this->createAndEqualsFilter(array(
            "user_id" => $this->escape($userId), 
            "id" => $this->escape($rpiId)));
        
        $sql = 
<<<EOD
            DELETE 
            FROM rpi
            WHERE $filter;
                
EOD;
        return $this->execute($sql);
    }

    public function create($userId) {
        $userId = $this->escape($userId);
        $key = substr(md5(uniqid(true)), 0, 8);
        $sql = 
<<<EOD
            INSERT INTO rpi 
            (id, user_id, created_date)
            VALUES
            ('$key', $userId, DATE_FORMAT(NOW(), '%Y-%m-%d'));
                
EOD;
        $this->execute($sql);
        return $key;
    }

    public function touchStatus($rpi) {
        $id = $this->escape($rpi);
        $sql = 
<<<EOD
            UPDATE rpi 
            SET last_status_update = NOW()
            WHERE id = "$id";
                
EOD;
        return $this->execute($sql);
    }
}

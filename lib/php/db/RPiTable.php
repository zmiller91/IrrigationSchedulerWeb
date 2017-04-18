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
        $filter = $this->createAndEqualsFilter(array("user_id" => $userId, "id" => $rpiId));
        $sql = 
<<<EOD
            SELECT * 
            FROM rpi
            WHERE $filter;
                
EOD;
        return $this->execute($sql);
    }

    public function delete($userId, $rpiId = null) {
        $filter = $this->createAndEqualsFilter(array("user_id" => $userId, "id" => $rpiId));
        $sql = 
<<<EOD
            DELETE 
            FROM rpi
            WHERE $filter;
                
EOD;
        return $this->execute($sql);
    }

    public function create($userId) {
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
}

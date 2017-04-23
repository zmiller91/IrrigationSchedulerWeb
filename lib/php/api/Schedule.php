<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Schedule
 *
 * @author zmiller
 */
class Schedule extends Service {
    
    protected function allowableMethods() {
        return array(self::GET, self::PUT, self::DELETE, self::PATCH, self::POST);
    }

    protected function authorize() {
        
        // User must be logged in
        $this->m_oUser->authorize();
        $success = $this->m_oUser->m_bLoggedIn;
        if(!$success) {
            $this->setStatusCode(401);
        }
        
        // If user is requesting to access an RPi resource, then it must be theirs
        if($success &&  isset($this->m_aInput['rpi'])) {
            $RPiTable = new RPiTable($this->m_oConnection);
            $result = $RPiTable->select($this->m_oUser->m_iUserId, $this->m_aInput['rpi']['id']);
            
            // Any errors block access
            if($RPiTable->hasErrors()) {
                $this->m_oError->addAll($RPiTable->getErrors());
                $success = false;
            }
            
            // Empty result means 403
            elseif(empty($result)) {
                $this->setStatusCode(403);
                $success = false;
            }
        }
        
        // If user is requesting to access a schedule resource, then it must be theirs
        if($success &&  isset($this->m_aInput['id'])) {
            $ScheduleTable = new ScheduleTable($this->m_oConnection);
            $result = $ScheduleTable->select($this->m_oUser->m_iUserId, null, $this->m_aInput['id']);
            
            // Any errors block access
            if($ScheduleTable->hasErrors()) {
                $this->m_oError->addAll($ScheduleTable->getErrors());
                $success = false;
            }
            
            // Empty result means 403
            elseif(empty($result)) {
                $this->setStatusCode(403);
                $success = false;
            }
        }
        
        return $success;
    }

    protected function validate() {
        
        $requiredPaths = array(
            self::GET => array(),
            self::DELETE => array('/id'),
            self::PUT => array('/rpi', '/zone', '/name', '/start', '/duration', '/dow'),
            self::PATCH => array('/id', '/rpi', '/zone', '/name', '/start', '/duration', '/dow'),
            self::POST => array('/method', '/id', '/rpi', '/zone', '/start', '/duration', '/dow')
        );
        
        $validPaths = $this->validatePaths($this->m_aInput, $requiredPaths[$this->m_strMethod]);
        $validContent = $this->validateScheduleFields($this->m_aInput);
        return $validPaths && $validContent;
    }
    
    protected function post() {
        
        // Post message to RabbitMQ
        $this->sendToRPI(
                $this->m_aInput['rpi']['id'], 
                $this->m_aInput, 
                $this->m_aInput['method']
        );
        
        return true;
    }
    
    protected function patch() {
        
        $success = true;
        $ScheduleTable = new ScheduleTable($this->m_oConnection);
        
        // Get the old schedule
        $oldSchedule = $ScheduleTable->select(null, null, $this->m_aInput['id']);
        if($ScheduleTable->hasErrors()) {
            $this->m_oError->addAll($ScheduleTable->getErrors());
            $success = false;
        }
        
        if($success) {
            
            // If the RPi ID changed tell old RPi to delete schedule
            if(isset($oldSchedule[0]) && $oldSchedule[0]['rpi_id'] != $this->m_aInput['rpi']['id']) {
                $this->sendToRPI($oldSchedule[0]['rpi_id'], $this->m_aInput, 'delete');
            }
            
            // Update the database
            $ScheduleTable->update(
                $this->m_oUser->m_iUserId,
                $this->m_aInput['id'],
                $this->m_aInput['rpi']['id'],
                $this->m_aInput['name'], 
                $this->m_aInput['zone'], 
                $this->m_aInput['start'], 
                $this->m_aInput['duration'], 
                implode(',', $this->m_aInput['dow'])
            );

            // Log any errors
            if($ScheduleTable->hasErrors()) {
                $this->m_oError->addAll($ScheduleTable->getErrors());
                $success = false;
            }

            // Notify RPi
            if($success) {
                $this->sendToRPI($this->m_aInput['rpi']['id'], $this->m_aInput, 'update');
            }
        }
        
        return $success;
    }
    
    protected function delete() {
        
        $success = true;
        $ScheduleTable = new ScheduleTable($this->m_oConnection);
        
        // Update the database
        if(!empty($this->m_aInput['id'])) {
            $ScheduleTable->delete(
                $this->m_oUser->m_iUserId,
                null,
                $this->m_aInput['id']
            );
        }
        
        // Log any errors
        if($ScheduleTable->hasErrors()) {
            $this->m_oError->addAll($ScheduleTable->getErrors());
            $success = false;
        }
        
        // Notify the RPi
        if($success) {
            $this->sendToRPI(
                $this->m_aInput['rpi']['id'], 
                $this->m_aInput,
                'delete'
            );
        }
        
        return $success;
    }
    
    protected function get() {
        
        $success = true;
        $RPiTable = new RPiTable($this->m_oConnection);
        $ScheduleTable = new ScheduleTable($this->m_oConnection);
        
        // Get users schedules and rpis
        $schedules = $ScheduleTable->select($this->m_oUser->m_iUserId);
        $rpi = $RPiTable->select($this->m_oUser->m_iUserId);
        
        // Log errors
        if($RPiTable->hasErrors() || $ScheduleTable->hasErrors()) {
            $this->m_oError->addAll($RPiTable->getErrors());
            $this->m_oError->addAll($ScheduleTable->getErrors());
            $success = false;
        }
        
        // Map to output
        if($success) {
            $rpiMap = $RPiTable->map($rpi, array('id'));
            foreach($schedules as &$schedule) {
                $schedule['rpi'] = $rpiMap[$schedule['rpi_id']];
                $schedule['dow'] = explode(',', $schedule['dow']);
            }
            
            $this->m_mData = $schedules;
        }
        
        return $success;
    }

    protected function put() {
        
        $success = true;
        $RPiTable = new RPiTable($this->m_oConnection);
        $ScheduleTable = new ScheduleTable($this->m_oConnection);
        
        // Get rpi information and insert schedule
        $rpi = $RPiTable->select($this->m_oUser->m_iUserId, $this->m_aInput['rpi']['id']);
        $ScheduleTable->insert(
                $this->m_oUser->m_iUserId,
                $this->m_aInput['rpi']['id'],
                $this->m_aInput['name'], 
                $this->m_aInput['zone'], 
                $this->m_aInput['start'], 
                $this->m_aInput['duration'], 
                implode(',', $this->m_aInput['dow'])
            );

        // Log errors
        if($RPiTable->hasErrors() || $ScheduleTable->hasErrors()) {
            $this->m_oError->addAll($RPiTable->getErrors());
            $this->m_oError->addAll($ScheduleTable->getErrors());
            $success = false;
        }

        // Notify RPi and output new schedule id
        if($success) {
            $rpiRequest = $this->m_aInput;
            $rpiRequest['id'] = $ScheduleTable->selectLastInsertID();
            $this->sendToRPI(
                $this->m_aInput['rpi']['id'], 
                $rpiRequest,
                "add"
            );

            $this->m_mData = array("id" => $rpiRequest['id']);
        }
        
        return $success;
    }
    
    private function sendToRPI($channel, $schedule, $method) {
        
        $duration = split(":", $schedule['duration']);
        $duration = array(
            "hours" => $duration[0],
            "minutes" => $duration[1]
        );
        
        $time = split(":", date("H:i", strtotime($schedule['start'])));
        $time = array(
            "hours" => $time[0],
            "minutes" => $time[1]
        );
        
        $request = array(
            'method' => $method,
            'id' => $schedule['id'],
            'days' => $schedule['dow'],
            'time' => $time,
            'duration' => $duration,
            'duration' => $zone
        );
        
        
        $args = $channel . ' "' . addslashes(json_encode($request)) . '"';
        $cmd = implode(" ", array(PYTHON, RMQSEND, $args));
        $command = exec($cmd);
        $output = shell_exec($command);
        $this->m_mData = $output;
        return $output;
    }
    
    private function validatePaths($target, $paths) {
        $success = true;
        foreach($paths as $path) {
            $parts = split("/", $path);
            $temp = $target;
            foreach($parts as $part) {
                if(!empty($part)) {
                    if(!isset($temp[$part])) {
                        $this->m_oError->add("Object path `".$path."` must exist.");
                        $success = false;
                        break;
                    }

                    $temp = $temp[$part];
                }
            }
        }
        
        return $success;
    }
    
    private function validateScheduleFields($schedule) {
        $valid = true;
        
        // Name must be a string
        if(isset($schedule['name']) && trim($schedule['name']) == "") {
            $this->m_oError->add("'/name' must be a non-empty string.");
            $valid = false;
        }
        
        // ID must be an int
        if(isset($schedule['id']) && !is_int($schedule['id']) && !ctype_digit($schedule['id'])) {
            $this->m_oError->add("'/id' must be an integer.");
            $valid = false;
        }
        
        // rpi object must contain id
        if(isset($schedule['rpi']) && 
                (!is_array($schedule['rpi']) || 
                !isset($schedule['rpi']['id']) || 
                !is_string($schedule['rpi']['id']) ||
                trim($schedule['rpi']['id']) == "")
        ) {
            $this->m_oError->add("'/rpi' must be an object with a non-empty string 'id' field.");
            $valid = false;
        }
        
        // zone must be an int between 1 and 4
        if(isset($schedule['zone']) && 
                ((!is_int($schedule['zone']) && !ctype_digit($schedule['zone'])) ||
                !(1 <= intval($schedule['zone']) && intval($schedule['zone']) <= 4))
        ) {
            $this->m_oError->add("'/zone' must an integer between [1, 4].");
            $valid = false;
        }
        
        // start must be in the format HH:MM AM/PM
        $regex = '/^((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))$/';
        if(isset($schedule['start']) && 
                (!is_string($schedule['start']) || 
                !preg_match($regex, $schedule['start']) ||
                trim($schedule['start']) == "")
        ) {
            $this->m_oError->add("'/start' must be a non-empty string in the format HH:MM AM/PM.");
            $valid = false;
        }
        
        // duration must be in the format HH:MM
        $regex = '/^(([0-9]{2}):([0-5][0-9]))$/';
        if(isset($schedule['duration']) && 
                (!is_string($schedule['duration']) || 
                !preg_match($regex, $schedule['duration']) ||
                trim($schedule['duration']) == "")
        ) {
            $this->m_oError->add("'/duration' must be a non-emptystring in the format HH:MM.");
            $valid = false;
        }
        
        // dows must be a csv in and contain only [SUN, MON, TUE, WED, THU, FRI, SAT]
        if(isset($schedule['dow'])) {
            $validDow = true;
            if(!is_array($schedule['dow']) || empty($schedule['dow'])) {
                $validDow = false;
            }
            else {
                $validDays = array('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');
                $validDow = array_intersect($schedule['dow'], $validDays) == $schedule['dow'];
            }
            
            if(!$validDow) {
                $this->m_oError->add("`/dow` must be a non-empty csv containing the values (SUN, MON, TUE, WED, THUR, FRI, SAT).");
                $valid = false;
            }
        }
        
        // dows must be a csv in and contain only [SUN, MON, TUE, WED, THU, FRI, SAT]
        if(isset($schedule['method'])) {
            $validMethod = true;
            if(!is_string($schedule['method']) || empty($schedule['method'])) {
                $validMethod = false;
            }
            else {
                $validMethods = array('stop', 'play');
                $validMethod = in_array($schedule['method'], $validMethods);
            }
            
            if(!$validMethod) {
                $this->m_oError->add("`/method` must be either 'play' or 'stop'.");
                $valid = false;
            }
        }
        
        return $valid;
    }
    
}

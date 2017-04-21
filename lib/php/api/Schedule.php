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
        return array(self::GET, self::PUT, self::DELETE, self::PATCH);
    }

    protected function authorize() {
        $this->m_oUser->authorize();
        return $this->m_oUser->m_bLoggedIn;
    }

    protected function validate() {
        return true;
    }
    
    protected function get() {
        
        $success = true;
        $RPiTable = new RPiTable($this->m_oConnection);
        $ScheduleTable = new ScheduleTable($this->m_oConnection);
        $schedules = $ScheduleTable->select($this->m_oUser->m_iUserId);
        $rpi = $RPiTable->select($this->m_oUser->m_iUserId);
        
        if($RPiTable->hasErrors() || $ScheduleTable->hasErrors()) {
            $this->m_oError->addAll($RPiTable->getErrors());
            $this->m_oError->addAll($ScheduleTable->getErrors());
            $success = false;
        }
        
        if($success) {
            $rpiMap = $RPiTable->map($rpi, array('id'));
            foreach($schedules as &$schedule) {
                $schedule['rpi'] = $rpiMap[$schedule['rpi']];
            }
            
            $schedule['dow'] = explode(',', $schedule['dow']);
            $this->m_mData = $schedules;
        }
        
        return $success;
    }

    protected function put() {
        
        $success = true;
        $RPiTable = new RPiTable($this->m_oConnection);
        $ScheduleTable = new ScheduleTable($this->m_oConnection);
        
        // Check if user and rpi exist
        $rpi = $RPiTable->select($this->m_oUser->m_iUserId, $this->m_aInput['rpi']['id']);
        $success = !$RPiTable->hasErrors();
        if($success && !empty($rpi)) {
            
            // Insert into table
            $ScheduleTable->insert(
                    $this->m_aInput['rpi']['id'],
                    $this->m_aInput['name'], 
                    $this->m_aInput['zone'], 
                    $this->m_aInput['start'], 
                    $this->m_aInput['duration'], 
                    implode(',', $this->m_aInput['dow'])
                );
            
            // Set errors if they exist
            $success = !$ScheduleTable->hasErrors();
            if(!$success) {
                $this->m_oError->addAll($ScheduleTable->getErrors());
            }
            
            // Return the ID
            else {
                $this->m_mData = $ScheduleTable->selectLastInsertID();
            }
        }
        
        // Set errors if they exist
        else {
            $this->m_oError->addAll($RPiTable->getErrors());
        }
        
        return $success;
    }
}

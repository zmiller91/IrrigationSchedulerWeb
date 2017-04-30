<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of RPi
 *
 * @author zmiller
 */
class RPi extends Service {
    
    private $user = null;
    
    protected function allowableMethods() {
        return array(self::GET, self::PUT, self::DELETE);
    }

    protected function authorize() {
        $this->m_oUser->authorize();
        $authorized = $this->m_oUser->m_bLoggedIn;
        if(!$authorized) {
            $this->setStatusCode(401);
        }
        
        return $authorized;
    }

    protected function validate() {
        if(isset($this->m_aInput['rpi_id'])) {
            $rpiId = $this->m_aInput['rpi_id'];
            if(!ctype_alnum($rpiId) || strlen($rpiId) != 8) {
                $this->m_oError->add("Invalid Raspberry Pi ID.");
                $this->setStatusCode(422);
            }
        }
        
        if($this->m_strMethod === "DELETE") {
            if(!isset($this->m_aInput['rpi_id'])) {
                $this->m_oError->add("Raspberry Pi ID must be set.");
                $this->setStatusCode(422);
            }
        }
        
        return !$this->m_oError->hasError();
    }
    
    protected function get() {
        $RPiTable = new RPiTable($this->m_oConnection);
        $this->m_mData = $RPiTable->select($this->m_oUser->m_iUserId);
        return true;
    }
    
    protected function put() {
        $RPiTable = new RPiTable($this->m_oConnection);
        
        $rpiId = $RPiTable->create($this->m_oUser->m_iUserId);
        if($RPiTable->m_oError->hasError()) {
            $this->m_oError->addAll($RPiTable->m_oError->get());
            $this->setStatusCode(500);
            return false;
        }
        
        $rpi = $RPiTable->select($this->m_oUser->m_iUserId, $rpiId);
        if($RPiTable->m_oError->hasError()) {
            $this->m_oError->addAll($RPiTable->m_oError->get());
            $this->setStatusCode(500);
            return false;
        }
        
        $this->m_mData = $rpi[0];
        return true;
    }
    
    protected function delete() {
        
        $success = true;
        $RPiTable = new RPiTable($this->m_oConnection);
        $ScheduleTable = new ScheduleTable($this->m_oConnection);
        $schedules = $ScheduleTable->select($this->m_oUser->m_iUserId, $this->m_aInput['rpi_id']);
        if(!$ScheduleTable->hasErrors() && !empty($schedules)) {
            $this->m_oError->add("RPi in use. Please delete or edit schedule.");
            $this->setStatusCode(422);
            $success = false;
        }
        
        if($success) {
            $this->m_mData = $RPiTable->delete(
                    $this->m_oUser->m_iUserId, 
                    $this->m_aInput['rpi_id']
            );
        }
        
        if($RPiTable->hasErrors() || $ScheduleTable->hasErrors()) {
            $this->m_oError->addAll($RPiTable->getErrors());
            $this->m_oError->addAll($ScheduleTable->getErrors());
            $success = false;
        }
        
        return $success;
    }
}

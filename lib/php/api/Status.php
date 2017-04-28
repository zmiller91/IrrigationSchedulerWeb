<?php


class Status extends Service{
    protected function allowableMethods() {
        return array(self::POST);
    }

    protected function authorize() {
        return true;
    }

    protected function validate() {
        return true;
    }

    protected function post() {
        
        $success = true;
        $RPiTable = new RPiTable($this->m_oConnection);
        $rpi = $RPiTable->select(null, $this->m_aInput['rpi']);
        if(!$RPiTable->hasErrors() && !empty($rpi)) {
            $RPiTable->touchStatus($rpi[0]['id']);
        }     
        
        if($RPiTable->hasErrors()) {
            $this->m_oError->addall($RPiTable->getErrors());
            $success = false;
        }
        
        return $success;
    }
}

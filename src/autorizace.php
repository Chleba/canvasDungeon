<?
	session_start();
	include "./inc/mysql.php";

	/*$spojeni = Mysql_Connect("","","");
	$databaze = Mysql_Select_Db("");
	
	if(!IsSet($PHP_AUTH_USER)){
		Header("HTTP/1.0 401 Unautorized");
		Header("WWW-Authenticate: Basic realm=""");
		echo 'Bohu¾el nejste zaregistrováni nebo jste spatne napsali Vá¹ login nebo heslo';
		/*include "nepovoleno.php";
		exit;
	}
	else{*/
	
	
		$user = 0;
		$heslo = MD5($heslo);
		$sel_ = "select * from chleba_users where login='$login' and heslo='$heslo'";
		$vyb_ = Mysql_Query($sel_);
		if(@mysql_num_rows($vyb_)>0){
			$zaz_  = Mysql_Fetch_Object($vyb_);
			$user = Mysql_Num_Rows($vyb_);

			if($user==1){

                    if(session_is_registered("sess_user")){
                         session_unset("sess_user");
                         $s7 = "delete from chleba_sess_usr where session='$PHPSESSID'";
                         $v7 = mysql_query($s7);
                    }
                    
				$sela = "update chleba_users set prihlaseni=now() where login='$login'";
				$vyba = Mysql_Query($sela);
                    $selb = "insert into chleba_sess_usr values('$PHPSESSID','$zaz_->login','$REMOTE_ADDR',now())";
				$vybb = Mysql_Query($selb);
                    
				if(!session_is_registered("LoginUser")){
					session_register("LoginUser");
				}

				$_SESSION["LoginUser"]["id"] 		     = $zaz_->id;
				$_SESSION["LoginUser"]["login"]		= $zaz_->login;
				$_SESSION["LoginUser"]["heslo"]		= $zaz_->heslo;
				$_SESSION["LoginUser"]["mail"]		= $zaz_->mail;
				$_SESSION["LoginUser"]["icq"]		     = $zaz_->icq;
				$_SESSION["LoginUser"]["skype"]		= $zaz_->skype;
				$_SESSION["LoginUser"]["servis"]		= $zaz_->servis;
				$_SESSION["LoginUser"]["fotka"]		= $zaz_->fotka;
				$_SESSION["LoginUser"]["kraj"]		= $zaz_->kraj;
				$_SESSION["LoginUser"]["znameni"]		= $zaz_->znameni;

			$error=0;

          	}
		}
		else{
		     $error=1;
		}
		$adresa = $url.'&error='.$error;
		Header("Location: $adresa");

		
	/*
		if($user == 0){
			Header("HTTP/1.0 401 Unautorized");
			Header("WWW-Authenticate: Basic realm=""");
			echo 'Chlebovo haluzoidni haluzovnost nad vsema haluzema !!! :) chcu heslo a jmeno';
			/*include "nepovoleno.php";
			exit;	
		}
	}
	*/
?>

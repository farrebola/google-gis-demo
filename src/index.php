<?php

require_once 'google/appengine/api/users/User.php';
require_once 'google/appengine/api/users/UserService.php';

use google\appengine\api\users\User;
use google\appengine\api\users\UserService;

$user = UserService::getCurrentUser();

$logoutURL = UserService::createLogoutUrl('/');
$userNickname = $user->getNickName();

$userId = $user->getUserId();

include("index.phtml");